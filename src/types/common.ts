import type {
  ISpineFilters,
  ISpineConfig,
  IBound,
} from 'spine-web-player';

export type {
  TimeKeeper,
  SpineManage,
  SpineTools,
  SpinePlayer,
  IBonePosition,
  ISpineFilters,
  ISpineConfig,
  IBound,
  IBackground,
} from 'spine-web-player';

export type {
  VSpinePlayer,
} from 'spine-web-player/vue3';

export type RemoteOptions = {
  autoPlay?: boolean;
  debugMode?: boolean;
  animationName?: string;
  firstRenderScreen?: boolean;
  clearAssetsCache?: boolean;
  filterType?: ISpineFilters['type'];
  filterParams?: ISpineFilters['params'];
  bound?: IBound;
  uniBlendMode?: boolean;
  premultipliedAlpha?: boolean;
  dynamicCalcBound?: boolean;
  zIndex?: number;
};

export type RemoteAssets = ISpineConfig['assets'];

export type ISpineInfo = {
  version: string;
  bounds: IBound | null;
  bonesCount: number;
  customBounds?: IBound;
  skinName: string;
  animationName: string;
  skins: string[];
  animations: string[];
  isPaused: boolean;
  events: any[];
  soltNames: string[];
  slotName?: string; // 当前选中的插槽名称
};
