/**
 * Formatea un número de teléfono para mejor visualización
 */
export function formatPhoneNumber(phoneNumber: string): string {
  // Si el número comienza con +, lo mantenemos
  if (!phoneNumber) return '';
  
  const hasPlus = phoneNumber.startsWith('+');
  const digitsOnly = phoneNumber.replace(/\D/g, '');
  
  // Para números colombianos (asumiendo formato +57 XXX XXX XXXX)
  if (digitsOnly.length === 10 || (digitsOnly.length === 12 && digitsOnly.startsWith('57'))) {
    const countryCode = digitsOnly.length === 12 ? digitsOnly.substring(0, 2) : '57';
    const areaCode = digitsOnly.length === 12 ? digitsOnly.substring(2, 5) : digitsOnly.substring(0, 3);
    const middle = digitsOnly.length === 12 ? digitsOnly.substring(5, 8) : digitsOnly.substring(3, 6);
    const last = digitsOnly.length === 12 ? digitsOnly.substring(8) : digitsOnly.substring(6);
    
    return `+${countryCode} ${areaCode} ${middle} ${last}`;
  }
  
  // Para otros formatos, simplemente agrupamos los dígitos
  return hasPlus ? `+${digitsOnly}` : digitsOnly;
}
