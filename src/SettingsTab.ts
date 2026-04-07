import { App, PluginSettingTab, Setting } from "obsidian";
import type InheritedPropertiesPlugin from "./main";
import type { InheritableProperty } from "./settings";
import { PropertyScanner } from "./PropertyScanner";

export class InheritedPropertiesSettingTab extends PluginSettingTab {
	private plugin: InheritedPropertiesPlugin;
	private propertyScanner: PropertyScanner;
	private propertyListEl: HTMLElement | null = null;

	constructor(app: App, plugin: InheritedPropertiesPlugin) {
		super(app, plugin);
		this.plugin = plugin;
		this.propertyScanner = new PropertyScanner(plugin);
	}

	display(): void {
		const { containerEl } = this;
		containerEl.empty();

		containerEl.createEl("h2", { text: "Inherited Properties" });

		new Setting(containerEl)
			.setName("Enable inheritance")
			.setDesc(
				"Automatically inherit properties when creating notes via links"
			)
			.addToggle((toggle) =>
				toggle
					.setValue(this.plugin.settings.enabled)
					.onChange(async (value) => {
						this.plugin.settings.enabled = value;
						await this.plugin.saveSettings();
					})
			);

		containerEl.createEl("h3", { text: "Properties" });

		const datalist = document.createElement("datalist");
		datalist.id = "inherited-prop-suggestions";
		const suggestions = this.propertyScanner.scanVaultProperties();
		for (const suggestion of suggestions) {
			const option = document.createElement("option");
			option.value = suggestion;
			datalist.appendChild(option);
		}
		containerEl.appendChild(datalist);

		this.propertyListEl = containerEl.createDiv({
			cls: "inherited-properties-list",
		});
		this.renderPropertyList();

		new Setting(containerEl).addButton((btn) =>
			btn
				.setButtonText("Add Property")
				.setClass("mod-cta")
				.onClick(() => {
					this.plugin.settings.properties.push({
						key: "",
						enabled: true,
						triggerValues: [],
					});
					this.renderPropertyList();
				})
		);
	}

	private renderPropertyList(): void {
		if (!this.propertyListEl) return;
		this.propertyListEl.empty();

		const props = this.plugin.settings.properties;
		for (let i = 0; i < props.length; i++) {
			this.renderPropertyRow(props[i], i);
		}

		if (props.length === 0) {
			this.propertyListEl.createEl("p", {
				text: "No properties configured. Click 'Add Property' to add one.",
				cls: "setting-item-description",
			});
		}
	}

	private renderPropertyRow(
		prop: InheritableProperty,
		index: number
	): void {
		if (!this.propertyListEl) return;

		const rowEl = this.propertyListEl.createDiv({
			cls: "inherited-property-row",
		});

		new Setting(rowEl)
			.addToggle((toggle) =>
				toggle.setValue(prop.enabled).onChange(async (value) => {
					this.plugin.settings.properties[index].enabled = value;
					await this.plugin.saveSettings();
				})
			)
			.addText((text) => {
				text.setPlaceholder("Property key")
					.setValue(prop.key)
					.onChange(async (value) => {
						this.plugin.settings.properties[index].key = value;
						await this.plugin.saveSettings();
					});
				text.inputEl.setAttribute("list", "inherited-prop-suggestions");
				text.inputEl.style.minWidth = "120px";
			})
			.addText((text) => {
				text.setPlaceholder("Trigger values (comma-separated)")
					.setValue(prop.triggerValues.join(", "))
					.onChange(async (value) => {
						this.plugin.settings.properties[index].triggerValues =
							value
								.split(",")
								.map((v) => v.trim())
								.filter((v) => v !== "");
						await this.plugin.saveSettings();
					});
				text.inputEl.style.minWidth = "200px";
			})
			.addExtraButton((btn) =>
				btn
					.setIcon("trash")
					.setTooltip("Delete")
					.onClick(async () => {
						this.plugin.settings.properties.splice(index, 1);
						await this.plugin.saveSettings();
						this.renderPropertyList();
					})
			);
	}
}
