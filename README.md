# Lisence

This project is licensed under the MIT License, see the LICENSE.txt file for details

# Minion Flow Simulation

This project is a simulation model of minion wave control in **League of Legends (LoL)**. It was created as a fun way to visualize and experiment with the flow of minions, inspired by the game's mechanics.
I created this project to help a friend understand **minion wave control** in League of Legends. The simulation is an abstract representation of how minions interact and can be used as a learning tool or just for fun.

## Controls

- **Play**: Starts the simulation.
- **Pause**: Pauses the simulation.
- **2x Speed**: Doubles the simulation speed.
- **4x Speed**: Quadruples the simulation speed.
- **Click on Minions**: Reduces the clicked minion's count, simulating an attack.

## How It Works

The simulation represents minions as circles:
- Blue minions spawn on the left, while red minions spawn on the right.
- Each minion's size corresponds to its current count. When two minions of the same team meet, they merge into a larger circle.
- Minions stop upon encountering enemies and engage in "combat," reducing each other's count based on a damage rate.
- Tower zones at the ends of the field progressively reduce the numbers of enemy minions entering their area.

## How to Run

1. Clone this repository:
 ```bash
   git clone https://github.com/leaf2326/minion-flow-model-sim.git
```
2. Open `index.html` in a web browser.
