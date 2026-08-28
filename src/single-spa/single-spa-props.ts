import { ReplaySubject } from 'rxjs';
import type { AppProps } from 'single-spa';

export interface MoradaCustomProps {
  readonly apiBaseUrl: string;
}

export type SingleSpaProps = AppProps & MoradaCustomProps;

export const singleSpaPropsSubject = new ReplaySubject<SingleSpaProps>(1);
