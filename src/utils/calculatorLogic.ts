import { create, all } from 'mathjs';

const math = create(all, {});

const numericalIntegration = (exprStr: string, variable: string, a: number, b: number) => {
  try {
    const node = math.parse(exprStr);
    const code = node.compile();
    let n = 1000;
    const h = (b - a) / n;
    let sum = code.evaluate({ [variable]: a }) + code.evaluate({ [variable]: b });
    
    for (let i = 1; i < n; i += 2) {
      sum += 4 * code.evaluate({ [variable]: a + i * h });
    }
    for (let i = 2; i < n - 1; i += 2) {
      sum += 2 * code.evaluate({ [variable]: a + i * h });
    }
    return (h / 3) * sum;
  } catch (e) {
    throw new Error("Integration error");
  }
};

const solveEquation = (expr: string, variable: string = 'X', scope: any = {}): string => {
  try {
    const parts = expr.split('=');
    if (parts.length !== 2) throw new Error();
    
    // Function f(x) = left - right
    const fNode = math.parse(`(${parts[0]}) - (${parts[1]})`);
    const fCode = fNode.compile();

    const df = (x: number) => {
      const h = 1e-7;
      return (fCode.evaluate({ ...scope, [variable]: x + h }) - fCode.evaluate({ ...scope, [variable]: x - h })) / (2 * h);
    };

    let x = 0; // Initial guess
    for (let i = 0; i < 100; i++) {
      const y = fCode.evaluate({ ...scope, [variable]: x });
      if (Math.abs(y) < 1e-10) return Number(x.toFixed(10)).toString();
      const dy = df(x);
      if (dy === 0) break;
      x = x - y / dy;
    }
    
    return `X=${Number(x.toFixed(10)).toString()}`;
  } catch (e) {
    return 'Can\'t Solve';
  }
};

export const sanitizeForMathjs = (expression: string, ans: string): string => {

  let sanitized = expression;
  // Replace visual operators with math operators
  sanitized = sanitized.replace(/×/g, '*');
  sanitized = sanitized.replace(/÷/g, '/');
  sanitized = sanitized.replace(/−/g, '-'); 
  sanitized = sanitized.replace(/π/g, 'pi');
  
  // Replace Ans with previous result safely
  sanitized = sanitized.replace(/Ans/g, `(${ans || '0'})`);

  // Scientific notation and basic powers
  sanitized = sanitized.replace(/EXP/g, 'E');
  
  // For safety with square roots, Math.js expects sqrt(x)
  sanitized = sanitized.replace(/√\(/g, 'sqrt(');
  sanitized = sanitized.replace(/∛\(/g, 'cbrt(');

  // Fraction symbol
  sanitized = sanitized.replace(/⌟/g, '/');
  
  return sanitized;
};

export const calculateExpression = (expression: string, ans: string, mode: 'deg'|'rad' = 'deg'): { result: string, fractionResult?: string } => {
  if (!expression.trim()) return { result: '' };

  try {
    let sanitized = sanitizeForMathjs(expression, ans);

    // Evaluate basic integrals: ∫(expr, var, a, b)
    const intRegex = /∫\(([^,]+),([^,]+),([^,]+),([^)]+)\)/g;
    sanitized = sanitized.replace(intRegex, (match, expr, variable, aStr, bStr) => {
      const a = math.evaluate(aStr);
      const b = math.evaluate(bStr);
      const val = numericalIntegration(expr, variable.trim(), a, b);
      return val.toString();
    });

    // Evaluate derivative: d/dx(expr, var, val)
    const derivRegex = /d\/dx\(([^,]+),([^,]+),([^)]+)\)/g;
    sanitized = sanitized.replace(derivRegex, (match, expr, variable, valStr) => {
      const val = math.evaluate(valStr);
      const node = math.parse(expr);
      const code = node.compile();
      // Using basic central difference for numerical derivative
      const h = 1e-7;
      const v1 = code.evaluate({ [variable.trim()]: val + h });
      const v2 = code.evaluate({ [variable.trim()]: val - h });
      const deriv = (v1 - v2) / (2 * h);
      return deriv.toString();
    });

    let evalOutput;
    
    // Evaluate standard expression
    const scope: any = {
      x: 0,
      y: 0,
      A: 0,
      B: 0,
      C: 0,
      D: 0,
      M: 0,
      X: 0,
      Y: 0,
    };

    if (mode === 'deg') {
      scope.sin = (x: number) => Math.sin(x * Math.PI / 180);
      scope.cos = (x: number) => Math.cos(x * Math.PI / 180);
      scope.tan = (x: number) => Math.tan(x * Math.PI / 180);
      scope.asin = (x: number) => Math.asin(x) * 180 / Math.PI;
      scope.acos = (x: number) => Math.acos(x) * 180 / Math.PI;
      scope.atan = (x: number) => Math.atan(x) * 180 / Math.PI;
    }

    // Evaluate solve: if contains '='
    if (sanitized.includes('=')) {
      const solved = solveEquation(sanitized, 'X', scope);
      return { result: solved, fractionResult: solved };
    }

    evalOutput = math.evaluate(sanitized, scope);

    let decimalStr = '';
    let fracStr = '';

    if (typeof evalOutput === 'number') {
      const formatted = parseFloat(evalOutput.toPrecision(12));
      decimalStr = formatted.toString();
      try {
         const frac = math.fraction(formatted);
         fracStr = `${frac.n}⌟${frac.d}`;
         if (Number(frac.d) === 1) fracStr = decimalStr;
      } catch (e) {}
    } else {
      decimalStr = evalOutput?.toString() || '';
    }
    
    return { result: decimalStr, fractionResult: fracStr || decimalStr };
  } catch (err) {
    return { result: 'Syntax ERROR' };
  }
};
