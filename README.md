# NiczRetroSystem Installation Guide

## Directory Structure
```
/niczretrosystem
│
├── emulators/  
│   ├── emulator1/  
│   ├── emulator2/  
│
├── roms/  
│   ├── game1/  
│   ├── game2/  
│
├── scripts/  
│   ├── installer.sh  
│   ├── setup.sh  
│
├── config/  
│   ├── emulationstation/  
│   ├── niczretrosystem/  
│
└── README.md
```

## Dependencies
- EmulationStation
- RetroArch (or other emulators)
- Required libraries for compiling/installing the emulators

## Installation Guide
### 1. Prerequisites:
   - Use a compatible Linux OS, such as Raspberry Pi OS.
   - Update the package index and install necessary packages:
     ```bash
     sudo apt update && sudo apt upgrade -y
     sudo apt install git build-essential libasound2-dev libudev-dev -y
     ```

### 2. Clone the Repository:
   ```bash
   git clone https://github.com/codedevgamerme/niczretrosystem.git
   cd niczretrosystem
   ```

### 3. Run Setup Scripts:
   - Execute the installer and setup scripts:
     ```bash
     chmod +x scripts/installer.sh scripts/setup.sh
     ./scripts/installer.sh
     ./scripts/setup.sh
     ```

## Setup Scripts
### installer.sh
```bash
#!/bin/bash

# Update package lists
sudo apt update

# Install dependencies
sudo apt install -y emulationstation retroarch

# Additional emulators can be installed here
```

### setup.sh
```bash
#!/bin/bash

# Create necessary directories
mkdir -p $HOME/niczretrosystem/{emulators,roms,config}

# Copy default configuration files and settings
cp -r config/* $HOME/niczretrosystem/config/

echo "NiczRetroSystem setup complete! Add your ROMs to the 'roms' directory."
```

## SD Card Preparation
1. **Format the SD Card** using tools like `gparted` or `fdisk`.
2. **Create a bootable image** on your SD card:
   - Use `dd` command or imaging tools for this purpose.
3. **Copy the `niczretrosystem` folder** to the appropriate directory of the SD card.