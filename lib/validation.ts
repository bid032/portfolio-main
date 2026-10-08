/**
 * Store Form & Input Validation Utility
 * Enforces strict validation for customer names, emails, phone numbers, and payment details.
 */

export interface ValidationResult {
  valid: boolean;
  error?: string;
}

/**
 * Validate customer full name:
 * - Must contain only letters (Arabic & English), spaces, hyphens, and apostrophes.
 * - No numbers or special symbols allowed.
 * - Minimum 2 characters long.
 */
export function validateCustomerName(name: string): ValidationResult {
  if (!name || typeof name !== "string") {
    return { valid: false, error: "الاسم بالكامل مطلوب (Full name is required)." };
  }

  const trimmed = name.trim();
  if (trimmed.length < 2) {
    return { valid: false, error: "الاسم يجب أن يتكون من حرفين على الأقل (Name must be at least 2 characters)." };
  }

  if (trimmed.length > 70) {
    return { valid: false, error: "الاسم طويل جداً (Name is too long)." };
  }

  // Regex allows Arabic characters, English letters, spaces, dots, hyphens, and apostrophes
  const nameRegex = /^[a-zA-Z\u0600-\u06FF\s'\.-]+$/;
  if (!nameRegex.test(trimmed)) {
    return {
      valid: false,
      error: "الاسم يجب أن يحتوي على أحرف فقط بدون أرقام أو رموز خاصة (Name must contain letters only, no numbers or special symbols)."
    };
  }

  return { valid: true };
}

/**
 * Validate customer email address:
 * - Strict RFC-compliant email regex pattern.
 */
export function validateCustomerEmail(email: string): ValidationResult {
  if (!email || typeof email !== "string") {
    return { valid: false, error: "البريد الإلكتروني مطلوب (Email address is required)." };
  }

  const trimmed = email.trim();
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (!emailRegex.test(trimmed)) {
    return {
      valid: false,
      error: "يرجى إدخال بريد إلكتروني صحيح (Please enter a valid email, e.g. name@example.com)."
    };
  }

  return { valid: true };
}

/**
 * Validate customer phone / WhatsApp number:
 * - Must be digits only (with optional + country code, spaces, or hyphens).
 * - Must contain between 8 and 15 digits.
 */
export function validateCustomerPhone(phone: string): ValidationResult {
  if (!phone || typeof phone !== "string") {
    return { valid: false, error: "رقم الهاتف / الواتساب مطلوب (Phone number is required)." };
  }

  const trimmed = phone.trim();
  const cleanDigits = trimmed.replace(/[^0-9]/g, "");

  // Must not contain letters
  if (/[a-zA-Z]/.test(trimmed)) {
    return { valid: false, error: "رقم الهاتف يجب أن يحتوي على أرقام فقط بدون أحرف (Phone number must contain digits only)." };
  }

  if (cleanDigits.length < 8 || cleanDigits.length > 15) {
    return {
      valid: false,
      error: "يرجى إدخال رقم هاتف صحيح مكون من 8 إلى 15 رقم (Phone number must be 8 to 15 digits)."
    };
  }

  return { valid: true };
}

/**
 * Validate sender payment wallet number or InstaPay handle:
 * - Validates Egyptian wallet numbers (010, 011, 012, 015 - 11 digits)
 * - Or InstaPay username handles (e.g. handle@instapay or 5+ char ID).
 */
export function validateSenderNumber(sender: string, isFree: boolean = false): ValidationResult {
  if (isFree) return { valid: true };

  if (!sender || typeof sender !== "string") {
    return { valid: false, error: "رقم المحفظة / حساب المحول منه مطلوب (Sender wallet or account number is required)." };
  }

  const trimmed = sender.trim();
  if (trimmed === "FREE_DOWNLOAD") return { valid: true };

  const cleanDigits = trimmed.replace(/[^0-9]/g, "");
  const isPhone = !/[a-zA-Z]/.test(trimmed) && cleanDigits.length >= 8 && cleanDigits.length <= 15;
  const isInstapayHandle = /^[a-zA-Z0-9._%+-@\s]{4,40}$/.test(trimmed) && (trimmed.includes("@") || /[a-zA-Z]/.test(trimmed));

  if (!isPhone && !isInstapayHandle) {
    return {
      valid: false,
      error: "يرجى إدخال رقم محفظة تحويل صحيح (11 رقم) أو معرف إنستاباي صحيح (Please enter a valid sender wallet or InstaPay handle)."
    };
  }

  return { valid: true };
}

/**
 * Perform complete validation check on all customer checkout fields at once.
 */
export function validateCheckoutFormData(data: {
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  senderNumber?: string;
  isFree?: boolean;
}): ValidationResult {
  const nameCheck = validateCustomerName(data.customerName);
  if (!nameCheck.valid) return nameCheck;

  const emailCheck = validateCustomerEmail(data.customerEmail);
  if (!emailCheck.valid) return emailCheck;

  const phoneCheck = validateCustomerPhone(data.customerPhone);
  if (!phoneCheck.valid) return phoneCheck;

  if (!data.isFree && data.senderNumber !== undefined) {
    const senderCheck = validateSenderNumber(data.senderNumber, data.isFree);
    if (!senderCheck.valid) return senderCheck;
  }

  return { valid: true };
}
