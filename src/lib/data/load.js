// Datat importeras statiskt och bundlas med appen — kod och data är alltid
// atomiskt konsistenta, och inget "Laddar data…"-läge behövs.
import overview from "../../data/overview.json";
import fTrend from "../../data/fTrend.json";
import npFordelning from "../../data/npFordelning.json";
import betygMatris from "../../data/betygMatris.json";
import kohort from "../../data/kohort.json";
import tidigaSignaler from "../../data/tidigaSignaler.json";

export const appData = {
  overview,
  fTrend,
  npFordelning,
  betygMatris,
  kohort,
  tidigaSignaler,
};
