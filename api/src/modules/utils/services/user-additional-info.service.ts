import { Injectable } from '@nestjs/common';
import { HEIGHTLIST, WEIGHTLIST } from '../constants';

@Injectable()
export class UserAdditionalInfoService {
  private heightList;

  private weightList;

  public getHeightList() {
    if (this.heightList) {
      return this.heightList;
    }

    this.heightList = HEIGHTLIST.map((h: string) => ({
      text: h
    }));
    return this.heightList;
  }

  public getWeightList() {
    if (this.weightList) {
      return this.weightList;
    }

    this.weightList = WEIGHTLIST.map((w: string) => ({
      text: w
    }));
    return this.weightList;
  }
}
