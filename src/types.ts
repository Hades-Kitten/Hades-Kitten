import type {
  Client,
  ApplicationCommandData,
  BaseInteraction,
  AutocompleteInteraction,
} from "discord.js";

export interface IEvent {
  event: string;
  execute: (client: Client, ...args: unknown[]) => Promise<void>;
  once?: boolean;
}

export interface ICommand {
  data: ApplicationCommandData;
  execute: (client: Client, interaction: BaseInteraction) => Promise<void>;
  autocomplete?: (interaction: AutocompleteInteraction) => Promise<void>;
}

//Nation
export interface Nation {
  $: {
    id: string;
  };
  NAME: string;
  FULLNAME: string;
  MOTTO: string;
  FREEDOM: {
    CIVILRIGHTS: string;
    ECONOMY: string;
    POLITICALFREEDOM: string;
  };
  REGION: string;
  POPULATION: string;
  TAX: string;
  ANIMAL?: string;
  CURRENCY: string;
  DEMONYM: string;
  DEMONYM2: string;
  DEMONYM2PLURAL: string;
  FLAG: string;
  BANNER?: string;
  MAJORINDUSTRY: string;
  GOVT: {
    ADMINISTRATION: string;
    DEFENCE: string;
    EDUCATION: string;
    ENVIRONMENT: string;
    HEALTHCARE: string;
    COMMERCE: string;
    INTERNATIONALAID: string;
    LAWANDORDER: string;
    PUBLICTRANSPORT: string;
    SOCIALEQUALITY: string;
    SPIRITUALITY: string;
    WELFARE: string;
  };
  SECTORS: {
    BLACKMARKET: string;
    GOVERNMENT: string;
    INDUSTRY: string;
    PUBLIC: string;
  };
  INDUSTRYDESC: string;
  FOUNDEDTIME: string;
  INFLUENCE: string;
  LEADER: string;
  CAPITAL: string;
  RELIGION: string;
  POLICIES?: {
    POLICY: Policy[];
  };
  CENSUS: {
    SCALE: Scale[];
  };
  FACTBOOKLIST?: {
    FACTBOOK: Factbook[];
  };
}

interface Policy {
  NAME: string;
  PIC: string;
  CAT: string;
  DESC: string;
}

interface Scale {
  $: {
    id: string;
  };
  SCORE: string;
  RANK: string;
  RRANK: string;
}

interface Factbook {
  $: {
    id: string;
  };
  TITLE: string;
  AUTHOR: string;
  CATEGORY: string;
  SUBCATEGORY: string;
  CREATED: string;
  EDITED: string;
  VIEWS: string;
  SCORE: string;
}

//Region
export interface Region {
  $: {
    id: string;
  };
  NAME: string;
  NUMNATIONS: string;
  NATIONS: string;
  UNNATIONS: string;
  DELEGATE: string;
  OFFICERS: {
    OFFICER: Officer[];
  };
  GOVERNOR: string;
  FOUNDEDTIME: string;
  POWER: string;
  FLAG: string;
  BANNERURL: string;
}

interface Officer {
  NATION: string;
  OFFICE: string;
  TIME: string;
  BY: string;
  ORDER: string;
}

export type VerifyData = {
  result: string;
};
