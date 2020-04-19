import com_01 from "./com_01.png";
import com_02 from "./com_02.png";
import com_03 from "./com_03.png";
import com_04 from "./com_04.png";
import Bateau from "../Bateau";

export default class PorteAvion extends Bateau {

    genererBateau() {
        return [
            com_01,
            com_02,
            com_03,
            com_04
        ];
    }
}