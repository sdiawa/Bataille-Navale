import cru_01 from "./cru_01.png";
import cru_02 from "./cru_02.png";
import cru_03 from "./cru_03.png";
import Bateau from "../Bateau";

export default class Croiseur extends Bateau {

    genererBateau() {
        return [
            cru_01,
            cru_02,
            cru_03
        ];
    }
}