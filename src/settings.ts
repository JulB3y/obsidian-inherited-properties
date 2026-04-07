export interface InheritableProperty {
	key: string;
	enabled: boolean;
	triggerValues: string[];
}

export interface InheritedPropertiesSettings {
	enabled: boolean;
	properties: InheritableProperty[];
}

export const DEFAULT_SETTINGS: InheritedPropertiesSettings = {
	enabled: true,
	properties: [],
};
