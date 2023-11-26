import { createContext } from "react";

export type IMeContext = {
  countries: any[] | null;
  refreshCountries: any;
};

const CountriesContext = createContext({
  countries: null,
  refreshCountries: () => {},
});
export default CountriesContext;
