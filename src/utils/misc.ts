import { isEmpty } from "lodash-es"
import { Place } from "./geonames"

export const makePlaceName = (place: Place) => {
  return [place.city, place.country].filter((x) => !isEmpty(x)).join(", ")
}
