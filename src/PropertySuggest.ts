import { App, AbstractInputSuggest } from "obsidian";
import { PropertyScanner } from "./PropertyScanner";

export class PropertySuggest extends AbstractInputSuggest<string> {
	private propertyScanner: PropertyScanner;
	private inputEl: HTMLInputElement;

	constructor(app: App, propertyScanner: PropertyScanner, inputEl: HTMLInputElement) {
		super(app, inputEl);
		this.inputEl = inputEl;
		this.propertyScanner = propertyScanner;
	}

	getSuggestions(query: string): string[] {
		const allProps = this.propertyScanner.scanVaultProperties();
		if (!query) return allProps;
		const lower = query.toLowerCase();
		return allProps.filter((p) => p.toLowerCase().contains(lower));
	}

	renderSuggestion(value: string, el: HTMLElement): void {
		el.setText(value);
	}

	selectSuggestion(value: string): void {
		this.setValue(value);
		this.inputEl.dispatchEvent(new Event("input", { bubbles: true }));
		const next = this.inputEl.nextElementSibling;
		if (next instanceof HTMLInputElement) {
			next.focus();
		}
	}
}
