import { Attribute } from "../../types";

export type ConfigAttributesState = {
	globalAttributes: Array<Attribute>;
	domainInformation: DomainInformationState;
	getConfigAttribute: (key: string) => string;
};

export type DomainInformationState = {
	id: string;
	name: string;
	a: Array<Attribute>;
};