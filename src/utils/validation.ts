export function isValidAmount(input: string): boolean {
    return /^\d{1,3}(,\d{3})*(\.\d{1,2})?$|^\d+(\.\d{1,2})?$/.test(input.replace(/₹\s?/g, ''));
}

export function parseAmountToNumber(input: string): number {
    const cleaned = input.replace(/[^0-9.]/g, '');
    const value = parseFloat(cleaned);
    return Number.isFinite(value) ? value : 0;
}

export function isValidCardNumber(input: string): boolean {
    const digits = input.replace(/\s+/g, '');
    if (!/^\d{12,19}$/.test(digits)) return false;
    // Luhn check
    let sum = 0; let shouldDouble = false;
    for (let i = digits.length - 1; i >= 0; i--) {
        let digit = parseInt(digits.charAt(i), 10);
        if (shouldDouble) {
            digit *= 2;
            if (digit > 9) digit -= 9;
        }
        sum += digit;
        shouldDouble = !shouldDouble;
    }
    return sum % 10 === 0;
}

export function isValidUpiId(input: string): boolean {
    return /^[\w.-]{2,}@[\w.-]{2,}$/.test(input);
}
export const VALIDATION_RULES = {
    email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    pan: /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/,
    aadhaar: /^[2-9]{1}[0-9]{3}\s[0-9]{4}\s[0-9]{4}$/,
    phone: /^[6-9]\d{9}$/,
};

export const getPasswordStrength = (password: string) => {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^a-zA-Z0-9]/.test(password)) strength++;
    return strength;
};

export const formatAadhaar = (value: string) => value.replace(/\s/g, '').slice(0, 12).replace(/(\d{4})/g, '$1 ').trim();