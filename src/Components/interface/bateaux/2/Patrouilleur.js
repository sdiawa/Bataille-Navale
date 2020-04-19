import pat_01 from "./pat_01.png";
import pat_02 from "./pat_02.png";
import Bateau from "../Bateau";

export default class Patrouilleur extends Bateau {

    genererBateau() {
        return [
            pat_01,
            pat_02
        ];
    }
}