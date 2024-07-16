import {Color} from '@angular-material-components/color-picker';
import {Field} from '../../services/fields.service';

export const LAYER_UNADDED_ID = -1;

export class Layer {
  id: number;
  name: string;
  type?: string;
  group?: number;
  url?: string;
  color?: string;
  commonName?: string;
  commonDescription?: string;
  warning?: boolean;
  symbol?: string;
  cluster?: boolean;
  order?: number;
  lineWidth?: number;
  lineColor?: string;
  limitation?: boolean;
  icon?: string;
  layers?: Layer[];
  isGroup: boolean;
  col: Color;
  col1: Color;
  fields?: Field[];
}
