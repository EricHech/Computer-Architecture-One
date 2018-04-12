/**
 * LS-8 v2.0 emulator skeleton code
 */

const MUL = 0b10101010;
const ADD = 0b10101000;
const LDI = 0b10011001;
const PRN = 0b01000011;
const POP = 0b01001100;
const PUSH = 0b01001101;
const CALL = 0b01001000;
const RET = 0b00001001;
const HLT = 0b00000001;

const SP = 7;

/**
 * Class for simulating a simple Computer (CPU & memory)
 */
class CPU {
  /**
   * Initialize the CPU
   */
  constructor(ram) {
    this.ram = ram;

    this.reg = new Array(8).fill(0); // General-purpose registers R0-R7

    // Special-purpose registers
    this.reg.PC = 0; // Program Counter

    this.reg[SP] = 0xf4;

    this.flag = false;
  }

  /**
   * Store value in memory address, useful for program loading
   */
  poke(address, value) {
    this.ram.write(address, value);
  }

  /**
   * Starts the clock ticking on the CPU
   */
  startClock() {
    this.clock = setInterval(() => {
      this.tick();
    }, 1); // 1 ms delay == 1 KHz clock == 0.000001 GHz
  }

  /**
   * Stops the clock
   */
  stopClock() {
    clearInterval(this.clock);
  }

  /**
   * ALU functionality
   *
   * The ALU is responsible for math and comparisons.
   *
   * If you have an instruction that does math, i.e. MUL, the CPU would hand
   * it off to it's internal ALU component to do the actual work.
   *
   * op can be: ADD SUB MUL DIV INC DEC CMP
   */
  alu(op, regA, regB) {
    switch (op) {
      case 'MUL':
        this.reg[regA] *= this.reg[regB];
        break;
      case 'ADD':
        this.reg[regA] += this.reg[regB];
        break;
    }
  }

  /**
   * Advances the CPU one cycle
   */
  tick() {
    // Load the instruction register (IR--can just be a local variable here)
    // from the memory address pointed to by the PC. (I.e. the PC holds the
    // index into memory of the instruction that's about to be executed
    // right now.)

    // !!! IMPLEMENT ME
    let IR = this.reg.PC; //.toString(2);

    // Debugging output
    //console.log(`${this.reg.PC}: ${IR.toString(2)}`);

    // Get the two bytes in memory _after_ the PC in case the instruction
    // needs them.

    // !!! IMPLEMENT ME
    let operandA = this.ram.read(IR + 1);
    let operandB = this.ram.read(IR + 2);

    // Execute the instruction. Perform the actions for the instruction as
    // outlined in the LS-8 spec.

    const _push = value => {
      this.reg[SP]--;
      this.ram.write(this.reg[SP], value);
    };

    switch (this.ram.read(IR)) {
      case LDI:
        this.reg[operandA] = operandB;
        break;
      case MUL:
        this.alu('MUL', operandA, operandB);
        break;
      case ADD:
        this.alu('ADD', operandA, operandB);
        break;
      case PUSH:
        _push(this.reg[operandA]);
        break;
      case POP:
        this.reg[operandA] = this.ram.read(this.reg[SP]);
        this.reg[SP]++;
        break;
      case CALL:
        this.flag = true;
        _push(this.reg.PC + 2);
        this.reg.PC = this.reg[operandA];
        break;
      case RET:
        this.flag = true;
        this.reg.PC = this.ram.read(this.reg[SP]);
        this.reg[SP]++;
        break;
      case PRN:
        console.log(this.reg[operandA]);
        break;
      case HLT:
        this.stopClock();
        break;
    }

    // Increment the PC register to go to the next instruction. Instructions
    // can be 1, 2, or 3 bytes long. Hint: the high 2 bits of the
    // instruction byte tells you how many bytes follow the instruction byte
    // for any particular instruction.

    // !!! IMPLEMENT ME
    if (!this.flag) {
      this.reg.PC++;
      this.reg.PC += this.ram.read(IR) >> 6;
    }
    this.flag = false;
  }
}

module.exports = CPU;
