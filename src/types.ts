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

export interface Nation {
  NAME: string;
  TYPE: string;
  FULLNAME: string;
  MOTTO: string;
  CATEGORY?: string;
  UNSTATUS?: string;
  ENDORSEMENTS?: string;
  ISSUES_ANSWERED: string;
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
  MAJORINDUSTRY?: string;
  GOVTPRIORITY?: string;
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
  FOUNDED: string;
  FIRSTLOGIN: string;
  LASTLOGIN: string;
  LASTACTIVITY: string;
  INFLUENCE: string;
  INFLUENCENUM: string;
  FREEDOMSCORES: {
    CIVILRIGHTS: string;
    ECONOMY: string;
    POLITICALFREEDOM: string;
  };
  PUBLICSECTOR: string;
  DEATHS: {
    CAUSE: Cause[];
  };
  LEADER: string;
  CAPITAL: string;
  RELIGION: string;
  FACTBOOKS: string;
  DISPATCHES: string;
  DBID: string;
}

interface Cause {
  $: {
    type: string;
  };
  _: string;
}
