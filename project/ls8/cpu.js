/**
 * LS-8 v2.0 emulator skeleton code
 */

const MUL = 0b10101010;
const ADD = 0b10101000;
const LDI = 0b10011001;
const POP = 0b01001100;
const PUSH = 0b01001101;
const CALL = 0b01001000;
const JMP = 0b01010000;
const RET = 0b00001001;
const IRET = 0b00001011;
const PRN = 0b01000011;
const PRA = 0b01000010;
const ST = 0b10011010;
const HLT = 0b00000001;

// System-utilized general purpose registers
const IM = 5; // Interrupt Mask:    register R5
const IS = 6; // Interrupt Status:  register R6
const SP = 7; // Stack Pointer:     register R7

// Interrupt mask bits
const intMask = [
  0x1 << 0, // timer    00000001
  0x1 << 1, // keyboard 00000010
  0x1 << 2, // reserved 00000100
  0x1 << 3, // reserved 00001000
  0x1 << 4, // reserved 00010000
  0x1 << 5, // reserved 00100000
  0x1 << 6, // reserved 01000000
  0x1 << 7, // reserved 10000000
];

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

    this.PCflag = false;

    this.ITenabled = true;
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

    this.interruptTimer = setInterval(() => {
      this.reg[IS] |= intMask[0];
    }, 1000);
  }

  /**
   * Stops the clock
   */
  stopClock() {
    clearInterval(this.clock);
    clearInterval(this.interruptTimer);
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
    const _push = value => {
      this.reg[SP]--;
      this.ram.write(this.reg[SP], value);
    };

    const _pop = () => {
      const popped = this.ram.read(this.reg[SP]);
      this.reg[SP]++;
      return popped;
    };

    if (this.ITenabled) {
      let maskedInterrupts = this.reg[IS] & this.reg[IM];
      for (let i = 0; i <= 7; i++) {
        if (((maskedInterrupts >> i) & 0b1) === 1) {
          this.ITenabled = false;
          this.reg[IS] &= ~intMask[i];
          _push(this.reg.PC);
          for (let j = 0; j <= 6; j++) {
            _push(this.reg[j]);
          }
          this.reg.PC = this.ram.read(0xf8 + i);
          this.PCflag = true;
          break;
        }
      }
    }

    // Load the instruction register (IR--can just be a local variable here)
    // from the memory address pointed to by the PC. (I.e. the PC holds the
    // index into memory of the instruction that's about to be executed
    // right now.)

    // !!! IMPLEMENT ME
    let IR = this.reg.PC; //.toString(2);

    // Debugging output
    //console.log(`${this.reg.PC}: ${IR.toString(2)}`);

    // Debugging output because the IR variable is not exactly correct
    // console.log(`${IR}: ${this.ram.read(IR).toString(2)}`);

    // Get the two bytes in memory _after_ the PC in case the instruction
    // needs them.

    // !!! IMPLEMENT ME
    let operandA = this.ram.read(IR + 1);
    let operandB = this.ram.read(IR + 2);

    // Execute the instruction. Perform the actions for the instruction as
    // outlined in the LS-8 spec.

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
        this.reg[operandA] = _pop();
        break;
      case CALL:
        this.PCflag = true;
        _push(this.reg.PC + 2);
        this.reg.PC = this.reg[operandA];
        break;
      case JMP:
        this.PCflag = true;
        this.reg.PC = this.reg[operandA];
        break;
      case RET:
        this.PCflag = true;
        this.reg.PC = this.ram.read(this.reg[SP]);
        this.reg[SP]++;
        break;
      case IRET:
        this.ITenabled = true;
        this.PCflag = true;
        for (let i = 6; i >= 0; i--) {
          this.reg[i] = _pop();
        }
        this.reg.PC = _pop();
        break;
      case PRN:
        console.log(this.reg[operandA]);
        break;
      case PRA:
        console.log(String.fromCharCode(this.reg[operandA]));
        break;
      case ST:
        this.ram.write(this.reg[operandA], this.reg[operandB]);
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
    if (!this.PCflag) {
      this.reg.PC++;
      this.reg.PC += this.ram.read(IR) >> 6;
    }
    this.PCflag = false;
  }
}

module.exports = CPU;
