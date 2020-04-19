import sub_01 from "./sub_01.png"
import sub_02 from "./sub_02.png"
import sub_03 from "./sub_03.png"
import sub_04 from "./sub_04.png"
import sub_05 from "./sub_05.png"
import Bateau from "../Bateau";

export default class SousMarin extends Bateau {

    genererBateau() {
        return [
            sub_01,
            sub_02,
            sub_03,
            sub_04,
            sub_05
        ];
    }
}