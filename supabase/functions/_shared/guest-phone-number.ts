import { getCountries, getCountryCallingCode, parsePhoneNumberFromString, type CountryCode } from "libphonenumber-js/max";

export const DEFAULT_PHONE_COUNTRY: CountryCode = "BR";
export { getCountries, getCountryCallingCode, type CountryCode };

export function normalizeGuestMobile(raw: string, country?: CountryCode): string {
  const value = raw.trim();
  if (!value) throw new Error("Informe seu número de celular.");
  if (!/^[+\d\s().-]+$/.test(value) || value.length > 40 || (!country && !value.startsWith("+"))) {
    throw new Error("Informe um celular válido, com DDD e código do país.");
  }
  const phone = parsePhoneNumberFromString(value, { defaultCountry: country, extract: false });
  const type = phone?.getType();
  if (!phone?.isValid() || (country && phone.country !== country) || (type !== "MOBILE" && type !== "FIXED_LINE_OR_MOBILE")) {
    throw new Error("Informe um celular válido com DDD para o país selecionado.");
  }
  return phone.number;
}