/**
 * Remove caracteres não numéricos de uma string
 */
function stripNonNumeric(value: string): string {
  return value.replace(/\D/g, "");
}

/**
 * Formata valor para CNPJ: XX.XXX.XXX/XXXX-XX
 */
export function maskCnpj(value: string): string {
  const cleaned = stripNonNumeric(value);
  return cleaned
    .slice(0, 14)
    .replace(/^(\d{2})(\d)/, "$1.$2")
    .replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3")
    .replace(/^(\d{2})\.(\d{3})\.(\d{3})(\d)/, "$1.$2.$3/$4")
    .replace(/^(\d{2})\.(\d{3})\.(\d{3})\/(\d{4})(\d)/, "$1.$2.$3/$4-$5");
}

/**
 * Remove máscara CNPJ retornando apenas números
 */
export function unmaskCnpj(value: string): string {
  return stripNonNumeric(value);
}

/**
 * Formata valor para CPF: XXX.XXX.XXX-XX
 */
export function maskCpf(value: string): string {
  const cleaned = stripNonNumeric(value);
  return cleaned
    .slice(0, 11)
    .replace(/^(\d{3})(\d)/, "$1.$2")
    .replace(/^(\d{3})\.(\d{3})(\d)/, "$1.$2.$3")
    .replace(/^(\d{3})\.(\d{3})\.(\d{3})(\d)/, "$1.$2.$3-$4");
}

/**
 * Remove máscara CPF retornando apenas números
 */
export function unmaskCpf(value: string): string {
  return stripNonNumeric(value);
}

/**
 * Formata valor para data: DD/MM/YYYY
 */
export function maskDate(value: string): string {
  const cleaned = stripNonNumeric(value);
  return cleaned
    .slice(0, 8)
    .replace(/^(\d{2})(\d)/, "$1/$2")
    .replace(/^(\d{2})\/(\d{2})(\d)/, "$1/$2/$3");
}

/**
 * Remove máscara de data retornando apenas números
 */
export function unmaskDate(value: string): string {
  return stripNonNumeric(value);
}

/**
 * Formata valor para moeda BRL
 * Trata como entrada de número com até 2 casas decimais
 */
export function maskCurrency(value: string): string {
  const cleaned = stripNonNumeric(value);
  const number = parseInt(cleaned || "0", 10) / 100;
  return number.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

/**
 * Remove máscara de moeda retornando o valor em centavos (número inteiro)
 */
export function unmaskCurrency(value: string): string {
  return stripNonNumeric(value);
}
