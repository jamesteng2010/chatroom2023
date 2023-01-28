
import countryCodes, { CountryProperty } from 'country-codes-list'
import random  from 'random-name'

export const getCountryCodeList = ()=>{
    return countryCodes.customList('countryCode' as CountryProperty, `(+{countryCallingCode}) {countryNameEn} `)
}
export const getCountryCallingCodeByCode = (countryCode:any)=>{
    const country = countryCodes.findOne("countryCode" as CountryProperty,countryCode)
    return country.countryCallingCode;
}

export const getRandomName  = () =>{

    return random.first();
}
