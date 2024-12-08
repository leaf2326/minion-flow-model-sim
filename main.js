const canvas = document.getElementById('simulation');
document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        isPaused = true;
        updateButtonStates();
    }
});
const ctx = canvas.getContext('2d');
canvas.width = 1200;
canvas.height = 250;

let isPaused = false;
let speedMultiplier = 1;
const SPAWN_RATE = 1200;
const DEFAULT_MINION_SPEED = 0.7;
const RED_SPAWN_POSITION = canvas.width;
const BLUE_SPAWN_POSITION = 0;
const BASE_SIZE = 8;
const SIZE_FACTOR = 2;
const TOWER_DAMAGE_RATE = 0.01;
const TOWER_ZONE_WIDTH = 60;
const COLLISION_DAMAGE_RATE = 0.0003;

const playButton = document.getElementById('playButton');
const pauseButton = document.getElementById('pauseButton');
const doubleSpeedButton = document.getElementById('doubleSpeedButton');
const quadSpeedButton = document.getElementById('quadSpeedButton');

let spawnTimer = SPAWN_RATE - 1;

playButton.addEventListener('click', () => {
    isPaused = false;
    speedMultiplier = 1;
    updateButtonStates();
});

pauseButton.addEventListener('click', () => {
    isPaused = true;
    updateButtonStates();
});

doubleSpeedButton.addEventListener('click', () => {
    if (isPaused) {
        isPaused = false;
    }
    speedMultiplier = 2;
    updateButtonStates();
});

quadSpeedButton.addEventListener('click', () => {
    if (isPaused) {
        isPaused = false;
    }
    speedMultiplier = 4;
    updateButtonStates();
});

function updateButtonStates() {
    playButton.classList.toggle('active', !isPaused && speedMultiplier === 1);
    pauseButton.classList.toggle('active', isPaused);
    doubleSpeedButton.classList.toggle('active', !isPaused && speedMultiplier === 2);
    quadSpeedButton.classList.toggle('active', !isPaused && speedMultiplier === 4);
}

updateButtonStates();

// minion class
class Minion {
    constructor(x, team, count = 6) {
        this.x = x;
        this.team = team; // "red" or "blue"
        this.HP = count;
        this.count = Math.ceil(this.HP);
        this.size = this.calculateSize();
        this.speed = team === "blue" ? DEFAULT_MINION_SPEED : -DEFAULT_MINION_SPEED;
        this.stopped = false; 
        this.needsRedraw = false;
    }

    calculateSize() {
        return BASE_SIZE + this.count * SIZE_FACTOR;
    }

    draw() {
        ctx.beginPath();
        ctx.arc(this.x, canvas.height / 2, this.size, 0, Math.PI * 2);
        ctx.fillStyle = this.team === "blue" ? "blue" : "red";
        ctx.fill();
        ctx.fillStyle = "white";
        ctx.font = "12px Arial";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(this.count, this.x, canvas.height / 2);
    }
}

const minions = [];

canvas.addEventListener('click', (event) => {
    const rect = canvas.getBoundingClientRect();
    const clickX = event.clientX - rect.left;
    const clickY = event.clientY - rect.top;

    minions.forEach(minion => {
        const distance = Math.sqrt((clickX - minion.x) ** 2 + (clickY - canvas.height / 2) ** 2);
        if (distance < minion.size) {
            minion.HP = Math.max(0, minion.HP - 1);
            minion.count = Math.ceil(minion.HP);
            const previousSize = minion.size;
            minion.size = minion.calculateSize();
            minion.needsRedraw = true;
            if (minion.stopped) {
                if (minion.team === "blue") {
                    minion.x -= (minion.size - previousSize);
                } else {
                    minion.x += (minion.size - previousSize);
                }
            }
        }
    });
});

function isInTowerZone(minion) {
    return (minion.team === "red" && minion.x - minion.size <= TOWER_ZONE_WIDTH) ||
        (minion.team === "blue" && minion.x + minion.size >= canvas.width - TOWER_ZONE_WIDTH);
}
function updateDebugInfo() {
    const debugElement = document.getElementById("debugInfo");
    const minionInfo = minions.map((minion, index) => {
        return `#${index} [${minion.team.toUpperCase()}] X: ${minion.x.toFixed(2)}, HP: ${minion.HP.toFixed(2)}, Size: ${minion.size.toFixed(2)}`;
    }).join('\n');

    const totalRedHP = minions.filter(m => m.team === "red").reduce((sum, m) => sum + m.HP, 0);
    const totalBlueHP = minions.filter(m => m.team === "blue").reduce((sum, m) => sum + m.HP, 0);

    debugElement.textContent = `ミニオンの状態:\n${minionInfo}\n\n合計HP: RED=${totalRedHP.toFixed(2)}, BLUE=${totalBlueHP.toFixed(2)}`;
}
function update() {

    if (isPaused) return;

    spawnTimer += speedMultiplier;
    if (spawnTimer >= SPAWN_RATE) {
        minions.push(new Minion(RED_SPAWN_POSITION, "red"));
        minions.push(new Minion(BLUE_SPAWN_POSITION, "blue"));
        spawnTimer = 0;
    }

    minions.forEach(m => {
        if (!m.stopped) {
            m.x += m.speed * speedMultiplier;
        }
    });
    minions.forEach((m, i) => {
        if (isInTowerZone(m)) {
            m.stopped = true;
            m.HP -= TOWER_DAMAGE_RATE * speedMultiplier;
            m.count = Math.ceil(m.HP);
            const previousSize = m.size;

            m.size = m.calculateSize();

            if (m.team === "blue") {
                m.x -= (m.size - previousSize);
            } else {
                m.x += (m.size - previousSize);
            }
            if (m.count <= 0) {
                minions.forEach(other => {
                    if (other.stopped && Math.abs(other.x - m.x) < other.size + m.size) {
                        other.stopped = false;
                    }
                });
                minions.splice(i, 1);
                i--;
            }
        }
    })
    for (let i = 0; i < minions.length; i++) {
        const m = minions[i];
        for (let j = 0; j < minions.length; j++) {
            if (i === j) continue;
            const other = minions[j];
            if (Math.abs(m.x - other.x) < m.size + other.size) {
                if (m.team === other.team) {
                    const previousSize = m.size;
                    m.HP += other.HP;
                    m.count = Math.ceil(m.HP);
                    m.size = m.calculateSize();

                    if (m.team === "blue") {
                        m.x -= (m.size - previousSize);
                    } else {
                        m.x += (m.size - previousSize);
                    }

                    minions.splice(j, 1);
                    if (j < i) {
                        i--;
                    }
                    j--;
                }
            }

        }
    }
    for (let i = 0; i < minions.length; i++) {
        const m = minions[i];
        for (let j = 0; j < minions.length; j++) {
            if (i === j) continue;
            const other = minions[j];
            if (Math.abs(m.x - other.x) < m.size + other.size) {
                if (m.team !== other.team) {
                    m.stopped = true;
                    other.stopped = true;

                    const previousCountM = m.count;
                    const damageToM = other.count * COLLISION_DAMAGE_RATE * speedMultiplier;
                    m.HP -= damageToM;
                    m.count = Math.ceil(m.HP);

                    const damageToOther = previousCountM * COLLISION_DAMAGE_RATE * speedMultiplier;
                    other.HP -= damageToOther;
                    other.count = Math.ceil(other.HP);
                    
                    const previousSizeM = m.size;
                    const previousSizeOther = other.size;
                    m.size = m.calculateSize();
                    other.size = other.calculateSize();
                    if (m.team === "blue") {
                        m.x -= Math.round(m.size - previousSizeM);
                        other.x += Math.round(other.size - previousSizeOther);
                    } else {
                        m.x += Math.round(m.size - previousSizeM);
                        other.x -= Math.round(other.size - previousSizeOther);
                    }

                    if (m.count <= 0) {
                        minions.splice(i, 1);
                        other.stopped = false;
                        if (i < j) {
                            j--;
                        }
                        i--;
                    }
                    if (other.count <= 0) {
                        minions.splice(j, 1);
                        m.stopped = false;
                        if (j < i) {
                            i--;
                        }
                        j--;
                    }
                } else {
                    const previousSize = m.size;
                    m.HP += other.HP;
                    m.count = Math.ceil(m.HP);
                    m.size = m.calculateSize();

                    if (m.team === "blue") {
                        m.x -= (m.size - previousSize);
                    } else {
                        m.x += (m.size - previousSize);
                    }

                    minions.splice(j, 1);
                    if (j < i) {
                        i--;
                    }
                    j--;
                }
            }

        }
    }
    updateDebugInfo();
}


function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = 'rgba(0, 0, 255, 0.3)';
    ctx.fillRect(0, 0, TOWER_ZONE_WIDTH, canvas.height);
    ctx.fillStyle = 'rgba(255, 0, 0, 0.3)';
    ctx.fillRect(canvas.width - TOWER_ZONE_WIDTH, 0, TOWER_ZONE_WIDTH, canvas.height);
    minions.forEach(minion => {
        if (minion.needsRedraw) {
            minion.needsRedraw = false;
            minion.draw();
        } else {
            minion.draw();
        }
    });
}

function loop() {
    update();
    draw();
    requestAnimationFrame(loop);
}

loop();