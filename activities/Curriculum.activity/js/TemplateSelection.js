var TemplateSelection = {
	/*html*/
	template: `
		<div class="template-selection" :style="{backgroundColor: userColors.fill}">
			<div class="template" v-for="(template, i) in defaultTemplates" :key="template.title" :id="i" @click="$emit('template-selected', template)">
				<div class="template-image">
					<img :src="template.templateImage">
				</div>
				<div class="template-content">
					<span>{{ template.templateTitle }}</span>
					<button id="edit-button" @click.stop="editIndex = i"></button>
				</div>
			</div>
			<button class="add-template" id="add-button" @click="showAddPopup = true"></button>

			<form @submit.prevent="addTemplate" class="template-popup" v-if="showAddPopup">
				<div class="popup-header">
					<h2 style="margin: 0">Add Template</h2>
					<div class="popup-buttons">
						<button type="button" id="cancel-button" @click="showAddPopup = false"></button>
						<button type="submit" id="confirm-button" :disabled="templateURL == ''"></button>
					</div>
				</div>
				<div class="popup-body">
					<label for="template-url">Template URL</label>
					<input type="url" id="template-url" v-model="templateURL">
				</div>
			</form>

			<form @submit.prevent="editIndex = null" class="template-popup" v-if="editIndex != null">
				<div class="popup-header">
					<h2 style="margin: 0">Edit Template</h2>
					<div class="popup-buttons">
						<button type="submit" id="confirm-button"></button>
					</div>
				</div>
				<div class="popup-body">
					<label for="template-title">Template Title</label>
					<input type="text" id="template-title" v-model="defaultTemplates[editIndex].templateTitle" required>
				</div>
			</form>
		</div>
	`,
	props: ['userColors'],
	data: function() {
		return {
			showAddPopup: false,
			editIndex: null,
			templateURL: '',
			defaultTemplates: []
		}
	},
	mounted: function() {
		var vm = this;
		this.loadList()
			.then(async (templateFiles) => {
				templateFiles = JSON.parse(templateFiles);
				
				for(let templateFile of templateFiles) {
					let template = await this.loadTemplate(templateFile);
					template = JSON.parse(template);
					if(template.metadata != null) {
						let temp = JSON.parse(vm.$root.$refs.SugarJournal.LZString.decompressFromUTF16(template.text));
						template = {
							templateTitle: temp.templateTitle,
							templateImage: temp.templateImage,
							notationLevel: temp.notationLevel,
							categories: temp.categories
						}
					} else {
						template.templateTitle = vm.$root.$refs.SugarL10n.get(template.templateTitle);
					}
					vm.defaultTemplates.push(template);
				}
			});
	},
	methods: {
		loadList() {
			return new Promise((resolve, reject) => {
				requirejs(["text!../defaultTemplates/templates.json"], function(templateFiles) {
					resolve(templateFiles);
				});
			});
		},	

		loadTemplate(templateFile) {
			return new Promise((resolve, reject) => {
				requirejs(["text!../defaultTemplates/" + templateFile], function(template) {
					resolve(template);
				});
			});
		},

		addTemplate: function() {
			var vm = this;
			requirejs([`text!${vm.templateURL}`], function(template) {
				var data = JSON.parse(vm.$root.$refs.SugarJournal.LZString.decompressFromUTF16(JSON.parse(template).text))
				vm.$emit('template-selected', {
					fromURL: true,
					categories: data.categories,
					notationLevel: data.notationLevel
				});
				showPopup = false;
			});
		}
	}
}