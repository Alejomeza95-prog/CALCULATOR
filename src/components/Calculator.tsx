import React, { useState, useEffect } from 'react';
import { cn } from '../lib/utils';
import { calculateExpression } from '../utils/calculatorLogic';
import { MoveLeft, MoveRight } from 'lucide-react';

export default function Calculator() {
  const [input, setInput] = useState<string>('');
  const [result, setResult] = useState<string>('');
  const [fractionResult, setFractionResult] = useState<string>('');
  const [displayFormat, setDisplayFormat] = useState<'dec' | 'frac'>('dec');
  const [ans, setAns] = useState<string>('0');
  const [isShifted, setIsShifted] = useState<boolean>(false);
  const [isAlpha, setIsAlpha] = useState<boolean>(false);
  const [opMode, setOpMode] = useState<'COMP' | 'EQN' | 'MAT'>('COMP');
  const [isModeSelection, setIsModeSelection] = useState<boolean>(false);

  // When a key that inserts text is pressed
  const insertText = (text: string) => {
    if (isModeSelection) {
      if (text === '1') setOpMode('COMP');
      else if (text === '2') setOpMode('EQN');
      else if (text === '3') setOpMode('MAT');
      setIsModeSelection(false);
      return;
    }

    // If the last thing was an error or an equals press, start a new expression 
    // unless we are continuing with an operator
    if (result === 'Syntax ERROR' || result === 'Math ERROR') {
      setInput(text);
      setResult('');
      setFractionResult('');
    } else if (result !== '' && !['+', '−', '×', '÷', '^', '²'].includes(text) && text !== 'EXP') {
      // Starting fresh after result (unless it's an operator)
      setInput(text);
      setResult('');
      setFractionResult('');
    } else if (result !== '') {
      // We are appending an operator to the previous result
      setInput('Ans' + text);
      setResult('');
      setFractionResult('');
    } else {
      setInput((prev) => prev + text);
    }
    setIsShifted(false);
    setIsAlpha(false);
  };

  const handleEqual = () => {
    if (!input) return;
    const calc = calculateExpression(input, ans);
    setResult(calc.result);
    setFractionResult(calc.fractionResult || calc.result);
    if (!calc.result.includes('ERROR')) {
      setAns(calc.result);
    }
    setIsShifted(false);
    setIsAlpha(false);
  };

  const handleSD = () => {
    setDisplayFormat(prev => prev === 'dec' ? 'frac' : 'dec');
  };

  const handleAC = () => {
    setInput('');
    setResult('');
    setFractionResult('');
    setIsShifted(false);
    setIsAlpha(false);
    setDisplayFormat('dec');
  };

  const handleDel = () => {
    if (result) {
      setResult('');
      setFractionResult('');
      return;
    }
    setInput((prev) => prev.slice(0, -1));
  };

  // Map keyboard presses
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      e.preventDefault();
      const key = e.key;

      if (key >= '0' && key <= '9') insertText(key);
      else if (key === '.') insertText('.');
      else if (key === '+') insertText('+');
      else if (key === '-') insertText('−');
      else if (key === '*') insertText('×');
      else if (key === '/') insertText('÷');
      else if (key === '(') insertText('(');
      else if (key === ')') insertText(')');
      else if (key === '^') insertText('^');
      else if (key === 'Enter' || key === '=') handleEqual();
      else if (key === 'Backspace') handleDel();
      else if (key === 'Escape') handleAC();
      // To simulate shift visually
      else if (key === 'Shift') setIsShifted((s) => !s);
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [input, result, ans]);

  // Button components for different types
  const FunctionButton = ({ label, shiftLabel, alphaLabel, onClick, className = '' }: any) => (
    <div className="flex flex-col items-center justify-end">
      <div className="flex w-full justify-between items-end px-[2px] mb-1 h-3 text-[7px] sm:text-[9px] font-bold tracking-tighter">
        <span className="text-[#eab308] truncate w-1/2">{shiftLabel}</span>
        <span className="text-[#f472b6] text-right truncate w-1/2">{alphaLabel}</span>
      </div>
      <button
        onClick={onClick}
        className={cn(
          "w-full h-8 sm:h-7 bg-[#374151] text-white text-[9px] sm:text-[10px] rounded-sm shadow uppercase font-bold active:bg-slate-600 transition-colors flex items-center justify-center",
          className
        )}
      >
        {label}
      </button>
    </div>
  );

  const NumpadButton = ({ label, onClick, className = '' }: any) => (
    <button
      onClick={onClick}
      className={cn(
        "col-span-1 h-10 sm:h-12 bg-[#cbd5e1] text-slate-900 font-bold text-lg sm:text-xl rounded-md shadow-lg active:bg-[#aab5c2] active:shadow-md transition-all flex items-center justify-center",
        className
      )}
    >
      {label}
    </button>
  );

  const OperatorButton = ({ label, onClick, className = '' }: any) => (
    <button
      onClick={onClick}
      className={cn(
        "col-span-1 h-10 sm:h-12 bg-[#374151] text-white font-bold text-xl sm:text-2xl rounded-md shadow-lg active:bg-[#4a5568] active:shadow-md transition-all flex items-center justify-center",
        className
      )}
    >
      {label}
    </button>
  );

  const ActionButton = ({ label, onClick, className = '' }: any) => (
    <button
      onClick={onClick}
      className={cn(
        "col-span-1 h-10 sm:h-12 bg-[#dc2626] text-white font-bold text-xs sm:text-sm rounded-md shadow-lg active:bg-[#b91c1c] active:shadow-md transition-all flex items-center justify-center",
        className
      )}
    >
      {label}
    </button>
  );

  return (
    <div className="flex items-center justify-center w-full min-h-screen bg-[#cbd5e1] font-sans p-2 sm:p-4">
      {/* Calculator Body */}
      <div className="relative w-full max-w-[520px] bg-[#2d333b] rounded-[30px] sm:rounded-[40px] p-5 sm:p-10 shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5)] border-b-[6px] sm:border-b-[10px] border-r-[3px] sm:border-r-[4px] border-[#1a1e23]">
        
        {/* Header Section */}
        <div className="flex justify-between items-start mb-4 sm:mb-6 px-1 sm:px-2">
          <div className="flex flex-col">
            <span className="text-white font-black italic text-lg sm:text-xl tracking-tighter flex items-center gap-1.5"><span className="uppercase">DIEGO</span> <span className="text-[10px] sm:text-sm font-bold opacity-80 uppercase not-italic tracking-normal">Calculator</span></span>
            <span className="text-[#94a3b8] text-[8px] sm:text-[10px] font-bold tracking-widest mt-0.5 uppercase flex flex-col leading-tight pt-1">
              <span>Programada por</span>
              <span>Diego Narváez</span>
            </span>
          </div>
          <div className="flex flex-col items-end">
            <div className="w-12 sm:w-16 h-3 sm:h-4 bg-[#4a3427] border border-[#2d333b] rounded-sm mb-1 shadow-inner flex items-center justify-around">
              <div className="w-px h-full bg-[#3d2b20]"></div>
              <div className="w-px h-full bg-[#3d2b20]"></div>
              <div className="w-px h-full bg-[#3d2b20]"></div>
              <div className="w-px h-full bg-[#3d2b20]"></div>
            </div>
            <span className="text-white font-bold text-[10px] sm:text-xs italic">fx-LED</span>
          </div>
        </div>

        {/* Screen Display */}
        <div className="bg-white w-full h-24 sm:h-28 rounded-[8px] sm:rounded-[12px] border-[3px] sm:border-4 border-[#1a1e23] shadow-[inset_0_0_12px_rgba(0,0,0,0.15)] mb-6 sm:mb-8 p-2 sm:p-3 flex flex-col justify-between font-casio">
          <div className="flex justify-between items-start text-[#1e293b] opacity-80 text-[10px] sm:text-xs">
            <div className="flex gap-2 font-bold tracking-widest">
              <span className={cn("transition-opacity", isShifted ? "opacity-100" : "opacity-0")}>S</span>
              <span className={cn("transition-opacity", isAlpha ? "opacity-100" : "opacity-0")}>A</span>
              <span className="opacity-100">D</span>
            </div>
            <span className="font-bold text-[8px] sm:text-[9px] tracking-widest leading-none mt-0.5">{opMode} S-V.P.A.M.</span>
          </div>
          
          <div className="flex flex-col justify-end text-right overflow-hidden flex-1 mt-1 font-digital text-[#0f172a]">
            {isModeSelection ? (
              <div className="text-left text-lg sm:text-xl leading-tight break-all flex flex-col items-start justify-start tracking-wider w-full h-full pt-1">
                <div className="flex gap-4"><span>1:COMP</span> <span>2:EQN</span></div>
                <div className="flex gap-4"><span>3:MAT</span></div>
              </div>
            ) : (
              <>
                <div className="text-lg sm:text-xl leading-tight break-all flex items-end justify-end tracking-wider">
                  <span>{input}<span className="inline-block w-2 bg-[#0f172a]/40 animate-pulse ml-[1px] h-3 sm:h-4 mb-0.5" /></span>
                </div>
                <div className="text-3xl sm:text-4xl font-bold break-all leading-none mt-1 flex items-end justify-end tracking-widest">
                  {displayFormat === 'frac' ? fractionResult : result}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Top Utility Buttons */}
        <div className="grid grid-cols-5 gap-2 sm:gap-3 mb-4 sm:mb-6">
          <div className="flex flex-col items-center">
            <span className="text-[#eab308] text-[8px] sm:text-[9px] font-bold mb-1">SHIFT</span>
            <button onClick={() => setIsShifted(!isShifted)} className={cn("w-10 sm:w-12 h-5 sm:h-6 bg-[#eab308] rounded-sm shadow-md active:bg-[#b08709] transition-colors", isShifted && "ring-2 ring-white/50")}></button>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-[#f472b6] text-[8px] sm:text-[9px] font-bold mb-1">ALPHA</span>
            <button onClick={() => setIsAlpha(!isAlpha)} className={cn("w-10 sm:w-12 h-5 sm:h-6 bg-[#f472b6] rounded-sm shadow-md active:bg-[#c94a8c] transition-colors", isAlpha && "ring-2 ring-white/50")}></button>
          </div>
          <div className="col-span-1 flex flex-col items-center">
            <button className="w-12 sm:w-16 h-10 sm:h-12 bg-[#374151] rounded-[24px] border-2 border-[#1a1e23] shadow-lg flex flex-col items-center justify-between active:bg-[#2e3743] hover:bg-[#435061] transition-colors overflow-hidden p-1">
              <div className="w-1 h-1 bg-[#94a3b8] rounded-full mt-[1px] sm:mt-[2px]"></div>
              <div className="w-full flex justify-between items-center px-1">
                 <div className="w-1 h-1 bg-[#94a3b8] rounded-full"></div>
                 <div className="w-1 h-1 bg-[#94a3b8] rounded-full"></div>
              </div>
              <div className="w-1 h-1 bg-[#94a3b8] rounded-full mb-[1px] sm:mb-[2px]"></div>
            </button>
            <span className="text-[#94a3b8] text-[7px] sm:text-[8px] mt-1 uppercase font-bold tracking-wider">REPLAY</span>
          </div>
          <div className="flex flex-col items-center justify-center pt-2 sm:pt-3">
            <button onClick={() => setIsModeSelection(p => !p)} className="w-10 sm:w-12 h-5 sm:h-6 bg-[#374151] rounded-sm shadow-md text-[8px] sm:text-[10px] text-white font-bold active:bg-slate-600 transition-colors flex items-center justify-center">MODE</button>
          </div>
          <div className="flex flex-col items-center justify-center pt-2 sm:pt-3">
            <button onClick={handleAC} className="w-10 sm:w-12 h-5 sm:h-6 bg-[#374151] rounded-sm shadow-md text-[8px] sm:text-[10px] text-white font-bold active:bg-slate-600 transition-colors flex items-center justify-center">ON</button>
          </div>
        </div>

        {/* Scientific Grid */}
        <div className="grid grid-cols-6 gap-y-3 sm:gap-y-4 gap-x-1 sm:gap-x-2 mb-6 sm:mb-8">
          {/* Row 1 */}
          <FunctionButton label="CALC" shiftLabel="SOLVE" alphaLabel="=" onClick={() => { if (isShifted) { handleEqual(); } else if (isAlpha) { insertText('='); } }} />
          <FunctionButton label="∫" shiftLabel="d/dx" alphaLabel=":" onClick={() => insertText(isShifted ? 'd/dx(' : '∫(')} />
          <FunctionButton label="■/□" shiftLabel="d/c" onClick={() => insertText(isShifted ? 'd/c' : '⌟')} />
          <FunctionButton label="√" shiftLabel="∛" onClick={() => insertText(isShifted ? '∛(' : '√(')} />
          <FunctionButton label="x²" shiftLabel="x³" onClick={() => insertText(isShifted ? '^3' : '^2')} />
          <FunctionButton label="^" shiftLabel="ˣ√" onClick={() => insertText(isShifted ? 'ˣ√' : '^')} />

          {/* Row 2 */}
          <FunctionButton label="log" shiftLabel="10ˣ" alphaLabel="C" onClick={() => insertText(isShifted ? '10^(' : isAlpha ? 'C' : 'log(')} />
          <FunctionButton label="ln" shiftLabel="eˣ" onClick={() => insertText(isShifted ? 'e^(' : 'ln(')} />
          <FunctionButton label="(-)" shiftLabel="A" alphaLabel="A" onClick={() => insertText(isAlpha ? 'A' : '−')} />
          <FunctionButton label="°'&#34;" shiftLabel="B" alphaLabel="B" onClick={() => insertText(isAlpha ? 'B' : '°')} />
          {opMode === 'MAT' ? (
            <>
              <FunctionButton label="det" shiftLabel="sin⁻¹" alphaLabel="D" onClick={() => insertText(isShifted ? 'asin(' : isAlpha ? 'D' : 'det(')} />
              <FunctionButton label="inv" shiftLabel="cos⁻¹" alphaLabel="E" onClick={() => insertText(isShifted ? 'acos(' : isAlpha ? 'E' : 'inv(')} />
            </>
          ) : (
            <>
              <FunctionButton label="sin" shiftLabel="sin⁻¹" alphaLabel="D" onClick={() => insertText(isShifted ? 'asin(' : isAlpha ? 'D' : 'sin(')} />
              <FunctionButton label="cos" shiftLabel="cos⁻¹" alphaLabel="E" onClick={() => insertText(isShifted ? 'acos(' : isAlpha ? 'E' : 'cos(')} />
            </>
          )}

          {/* Row 3 */}
          {opMode === 'MAT' ? (
            <FunctionButton label="trn" shiftLabel="tan⁻¹" alphaLabel="F" onClick={() => insertText(isShifted ? 'atan(' : isAlpha ? 'F' : 'transpose(')} />
          ) : (
            <FunctionButton label="tan" shiftLabel="tan⁻¹" alphaLabel="F" onClick={() => insertText(isShifted ? 'atan(' : isAlpha ? 'F' : 'tan(')} />
          )}
          <FunctionButton label="RCL" shiftLabel="STO" alphaLabel="X" onClick={() => insertText(isAlpha ? 'X' : 'RCL')} />
          <FunctionButton label="ENG" shiftLabel="," alphaLabel="Y" onClick={() => insertText(isShifted ? ',' : isAlpha ? 'Y' : 'ENG')} />
          <FunctionButton label="(" shiftLabel="[" alphaLabel="M" onClick={() => insertText(isShifted ? '[' : isAlpha ? 'M' : '(')} />
          <FunctionButton label=")" shiftLabel="]" alphaLabel="x" onClick={() => insertText(isShifted ? ']' : isAlpha ? 'x' : ')')} />
          <FunctionButton label="S↔D" shiftLabel="M-" alphaLabel="M+" onClick={() => { handleSD(); setIsShifted(false); setIsAlpha(false); }} />
        </div>

          {/* Main Pad */}
          <div className="grid grid-cols-5 gap-2 sm:gap-3">
            <NumpadButton label="7" onClick={() => insertText('7')} />
            <NumpadButton label="8" onClick={() => insertText('8')} />
            <NumpadButton label="9" onClick={() => insertText('9')} />
            <ActionButton label="DEL" onClick={handleDel} />
            <ActionButton label="AC" onClick={handleAC} />

            <NumpadButton label="4" onClick={() => insertText('4')} />
            <NumpadButton label="5" onClick={() => insertText('5')} />
            <NumpadButton label="6" onClick={() => insertText('6')} />
            <OperatorButton label="×" onClick={() => insertText('×')} />
            <OperatorButton label="÷" onClick={() => insertText('÷')} />

            <NumpadButton label="1" onClick={() => insertText('1')} />
            <NumpadButton label="2" onClick={() => insertText('2')} />
            <NumpadButton label="3" onClick={() => insertText('3')} />
            <OperatorButton label="+" onClick={() => insertText('+')} />
            <OperatorButton label="−" onClick={() => insertText('−')} />

            <NumpadButton label="0" onClick={() => insertText('0')} />
            <NumpadButton label="." onClick={() => insertText('.')} />
            <NumpadButton label="EXP" onClick={() => insertText('EXP')} className="text-sm uppercase" />
            <OperatorButton label="Ans" onClick={() => insertText('Ans')} className="bg-[#cbd5e1] text-slate-900 border-none text-sm uppercase" />
            <OperatorButton className="bg-[#cbd5e1] text-slate-900 border-none active:bg-[#aab5c2]" label="=" onClick={handleEqual} />
          </div>
          
          {/* Bottom Decoration */}
          <div className="mt-8 flex justify-center opacity-30">
            <div className="h-1 w-24 bg-black rounded-full"></div>
          </div>
        </div>
      </div>
  );
}
