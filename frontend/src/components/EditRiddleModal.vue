<script setup>
import { reactive, watch, computed, ref } from 'vue';
import { useAdminStore } from 'stores/adminStore';
import { useQuasar } from 'quasar';

const props = defineProps({ modelValue: Boolean, riddle: Object });
const emit = defineEmits(['update:modelValue']);
const admin = useAdminStore();
const $q = useQuasar();

const blank = () => ({ id: null, quechua: '', translation: '', hint: '', explanation: '', answerLabel: '', answerImageId: null, unitId: null });
const form = reactive(blank());
const newFile = ref(null);
const uploading = ref(false);

watch(() => props.modelValue, (open) => {
  if (open) Object.assign(form, blank(), props.riddle ? { ...props.riddle, answerImageId: props.riddle.answerImageId ?? null, unitId: props.riddle.unitId ?? null } : {});
});

const unitOptions = computed(() => [{ id: null, title: '— sin temática —', subtitle: '' }, ...admin.units]);
const imageOptions = computed(() => [{ id: null, label: '— sin imagen —', url: '' }, ...admin.images]);

async function uploadHere() {
  if (!newFile.value) return;
  uploading.value = true;
  try {
    const img = await admin.uploadImage(newFile.value, form.answerLabel.trim());
    form.answerImageId = img.id; newFile.value = null;
    $q.notify({ type: 'positive', message: 'Imagen subida y seleccionada' });
  } catch (e) { $q.notify({ type: 'negative', message: e.response?.data?.error || 'No se pudo subir' }); }
  finally { uploading.value = false; }
}

async function save() {
  if (!form.quechua.trim() || !form.answerLabel.trim()) {
    $q.notify({ type: 'warning', message: 'Escribe la adivinanza en quechua y la respuesta' }); return;
  }
  try {
    await admin.saveRiddle({ ...form });
    $q.notify({ type: 'positive', message: 'Guardado ✅' });
    emit('update:modelValue', false);
  } catch (e) { $q.notify({ type: 'negative', message: e.response?.data?.error || 'Error al guardar' }); }
}
</script>

<template>
  <q-dialog :model-value="modelValue" @update:model-value="(v) => emit('update:modelValue', v)">
    <q-card style="width: 640px; max-width: 95vw">
      <q-card-section><div class="text-h6">{{ form.id ? 'Editar adivinanza' : 'Nueva adivinanza' }}</div></q-card-section>
      <q-card-section class="q-gutter-md">
        <q-input v-model="form.quechua" type="textarea" autogrow outlined label="Adivinanza en Quechua *" />
        <q-input v-model="form.answerLabel" outlined label="Respuesta (texto) *" hint="Debe coincidir con la etiqueta de la imagen para enlazarse sola" />
        <q-input v-model="form.translation" type="textarea" autogrow outlined label="Traducción al Español" />
        <q-input v-model="form.hint" outlined label="Pista (opcional)" />
        <q-input v-model="form.explanation" type="textarea" autogrow outlined label="Explicación al fallar (opcional)" />
        <q-select v-model="form.unitId" :options="unitOptions" option-value="id" :option-label="(u) => u.subtitle ? `${u.icon} ${u.title} · ${u.subtitle}` : u.title" emit-value map-options outlined label="Temática (unidad de la ruta)" />
        <q-select v-model="form.answerImageId" :options="imageOptions" option-value="id" option-label="label" emit-value map-options outlined label="Imagen de la respuesta">
          <template #option="{ opt, itemProps }">
            <q-item v-bind="itemProps">
              <q-item-section v-if="opt.url" avatar><q-avatar rounded><img :src="opt.url" /></q-avatar></q-item-section>
              <q-item-section>{{ opt.label }}</q-item-section>
            </q-item>
          </template>
        </q-select>
        <div class="row items-center q-col-gutter-sm">
          <div class="col"><q-file v-model="newFile" outlined dense accept="image/*" label="…o sube una imagen nueva para esta respuesta" /></div>
          <div class="col-auto"><q-btn color="primary" unelevated icon="cloud_upload" label="Subir" :loading="uploading" :disable="!newFile" @click="uploadHere" /></div>
        </div>
        <q-img v-if="form.answerImageId && admin.images.find((i) => i.id === form.answerImageId)" :src="admin.images.find((i) => i.id === form.answerImageId).url" style="max-width: 160px" fit="contain" ratio="1" class="rounded-borders" />
      </q-card-section>
      <q-card-actions align="right">
        <q-btn flat label="Cancelar" v-close-popup />
        <q-btn color="positive" unelevated label="Guardar" @click="save" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>
