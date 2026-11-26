<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue';
import { useQuasar } from 'quasar';
import { useAdminStore } from 'stores/adminStore';
import EditRiddleModal from 'components/EditRiddleModal.vue';
import SchoolBadge from 'components/SchoolBadge.vue';
import AppFooter from 'components/AppFooter.vue';

const $q = useQuasar();
const admin = useAdminStore();
const tab = ref('riddles');
const login = ref({ username: '', password: '' });
const modal = ref(false);
const editing = ref(null);

const upFile = ref(null);
const upLabel = ref('');
const docxFile = ref(null);
const preview = ref([]);
const busy = ref(false);

const err = (e) => $q.notify({ type: 'negative', message: e.response?.data?.error || e.message || 'Error' });
const ok = (message) => $q.notify({ type: 'positive', message });

onMounted(() => { if (admin.loggedIn) admin.loadAll().catch(err);
onBeforeUnmount(() => { admin.logout(); }); });

async function doLogin() {
  try { await admin.login(login.value.username, login.value.password); } catch (e) { err(e); }
}
function openEdit(r = null) { editing.value = r; modal.value = true; }
function removeRiddle(r) {
  $q.dialog({ title: 'Borrar adivinanza', message: 'Esta acción no se puede deshacer.', cancel: true })
    .onOk(async () => { try { await admin.deleteRiddle(r.id); ok('Borrada'); } catch (e) { err(e); } });
}
async function uploadImg() {
  if (!upFile.value) return;
  busy.value = true;
  try {
    const r = await admin.uploadImage(upFile.value, upLabel.value);
    ok(r.linkedRiddles ? `Subida y enlazada a ${r.linkedRiddles} adivinanza(s)` : 'Imagen subida');
    upFile.value = null; upLabel.value = '';
  } catch (e) { err(e); } finally { busy.value = false; }
}
function removeImg(i) {
  $q.dialog({
    title: 'Borrar imagen',
    message: `Se borrará "${i.label}" del servidor.` + (i.riddleCount ? ` ${i.riddleCount} adivinanza(s) quedarán sin imagen (no se borran).` : ''),
    cancel: true,
  }).onOk(async () => { try { await admin.deleteImage(i.id); ok('Imagen borrada'); } catch (e) { err(e); } });
}
function renameImg(i) {
  $q.dialog({ title: 'Cambiar etiqueta', prompt: { model: i.label, type: 'text' }, cancel: true })
    .onOk(async (v) => { try { await admin.renameImage(i.id, v); } catch (e) { err(e); } });
}
async function doPreview() {
  if (!docxFile.value) return;
  busy.value = true;
  try { preview.value = await admin.previewDocx(docxFile.value); } catch (e) { err(e); } finally { busy.value = false; }
}
async function doCommit() {
  busy.value = true;
  try {
    const r = await admin.commitDocx(preview.value);
    ok(`${r.created} adivinanzas importadas (${r.withoutImage} sin imagen aún)`);
    preview.value = []; docxFile.value = null; tab.value = 'riddles';
  } catch (e) { err(e); } finally { busy.value = false; }
}
</script>

<template>
  <div class="admin-wrap">
    <div class="row items-center q-mb-md">
      <router-link to="/" class="text-grey-7"><q-icon name="arrow_back" size="24px" /> Volver al juego</router-link>
      <q-space />
      <SchoolBadge style="margin: 0 12px 0 0" />
      <q-btn v-if="admin.loggedIn" flat no-caps icon="logout" label="Salir" @click="admin.logout()" />
    </div>
    <h2 class="q-mt-none">🐸 Panel de Imasmari</h2>

    <!-- Login -->
    <q-card v-if="!admin.loggedIn" flat bordered class="q-pa-md" style="max-width: 380px">
      <q-input v-model="login.username" outlined label="Usuario" class="q-mb-md" />
      <q-input v-model="login.password" type="password" outlined label="Contraseña" class="q-mb-md" @keyup.enter="doLogin" />
      <button class="btn3d" @click="doLogin">Entrar</button>
    </q-card>

    <template v-else>
      <q-tabs v-model="tab" align="left" active-color="positive" indicator-color="positive" no-caps>
        <q-tab name="riddles" icon="quiz" :label="`Adivinanzas (${admin.riddles.length})`" />
        <q-tab name="images" icon="image" :label="`Imágenes (${admin.images.length})`" />
        <q-tab name="import" icon="upload_file" label="Importar Word" />
      </q-tabs>
      <q-separator />

      <q-tab-panels v-model="tab" animated>
        <!-- Adivinanzas -->
        <q-tab-panel name="riddles">
          <q-btn color="positive" unelevated icon="add" label="Nueva adivinanza" class="q-mb-md" @click="openEdit()" />
          <q-list bordered separator class="rounded-borders">
            <q-item v-for="r in admin.riddles" :key="r.id">
              <q-item-section avatar>
                <q-avatar v-if="r.answerImage" rounded size="56px"><img :src="`/uploads/${r.answerImage.filename}`" /></q-avatar>
                <q-avatar v-else rounded size="56px" color="orange-2" text-color="orange-9" icon="image_not_supported"><q-tooltip>Sin imagen</q-tooltip></q-avatar>
              </q-item-section>
              <q-item-section>
                <q-item-label class="text-weight-bold">{{ r.quechua }}</q-item-label>
                <q-item-label caption>{{ r.translation }}</q-item-label>
                <q-item-label caption>Respuesta: <b>{{ r.answerLabel }}</b></q-item-label>
              </q-item-section>
              <q-item-section side>
                <div>
                  <q-btn flat round icon="edit" color="primary" @click="openEdit(r)" />
                  <q-btn flat round icon="delete" color="negative" @click="removeRiddle(r)" />
                </div>
              </q-item-section>
            </q-item>
            <q-item v-if="!admin.riddles.length"><q-item-section>No hay adivinanzas todavía.</q-item-section></q-item>
          </q-list>
        </q-tab-panel>

        <!-- Imágenes -->
        <q-tab-panel name="images">
          <q-card flat bordered class="q-pa-md q-mb-lg">
            <div class="row q-col-gutter-md items-center">
              <div class="col-12 col-sm-5"><q-file v-model="upFile" outlined accept="image/*" label="Elegir imagen" counter /></div>
              <div class="col-12 col-sm-4"><q-input v-model="upLabel" outlined label="Etiqueta (ej. Qhata)" /></div>
              <div class="col-12 col-sm-3"><q-btn color="positive" unelevated icon="cloud_upload" label="Subir" :loading="busy" :disable="!upFile" @click="uploadImg" /></div>
            </div>
          </q-card>
          <div class="img-grid">
            <q-card v-for="i in admin.images" :key="i.id" flat bordered>
              <q-img :src="i.url" ratio="1" fit="contain" />
              <q-card-section class="q-pa-sm">
                <div class="text-weight-bold ellipsis">{{ i.label }}</div>
                <div class="text-caption text-grey">{{ i.riddleCount }} adivinanza(s)</div>
              </q-card-section>
              <q-card-actions>
                <q-btn flat dense icon="edit" color="primary" @click="renameImg(i)" />
                <q-space />
                <q-btn flat dense icon="delete" color="negative" @click="removeImg(i)" />
              </q-card-actions>
            </q-card>
          </div>
        </q-tab-panel>

        <!-- Importar -->
        <q-tab-panel name="import">
          <p>Sube tu <b>.docx</b>. Formato: adivinanza, luego <code>Respuesta:</code>, <code>Traducción:</code> y opcional <code>Pista:</code>. Verás una vista previa editable antes de guardar.</p>
          <div class="row q-col-gutter-md items-center q-mb-md">
            <div class="col-12 col-sm-6"><q-file v-model="docxFile" outlined accept=".docx" label="Archivo Word (.docx)" /></div>
            <div class="col"><q-btn color="primary" unelevated icon="search" label="Analizar" :loading="busy" :disable="!docxFile" @click="doPreview" /></div>
          </div>
          <template v-if="preview.length">
            <div class="text-subtitle1 q-mb-sm">{{ preview.length }} adivinanzas detectadas — corrige lo que haga falta:</div>
            <q-card v-for="(p, n) in preview" :key="n" flat bordered class="q-pa-md q-mb-sm">
              <q-input v-model="p.quechua" dense outlined type="textarea" autogrow label="Quechua" class="q-mb-sm" />
              <div class="row q-col-gutter-sm">
                <div class="col-12 col-sm-4"><q-input v-model="p.answerLabel" dense outlined label="Respuesta" /></div>
                <div class="col-12 col-sm-8"><q-input v-model="p.translation" dense outlined label="Traducción" /></div>
              </div>
              <q-btn flat dense color="negative" icon="close" label="Quitar" class="q-mt-sm" @click="preview.splice(n, 1)" />
            </q-card>
            <q-btn color="positive" unelevated icon="save" label="Guardar todas" :loading="busy" @click="doCommit" />
          </template>
        </q-tab-panel>
      </q-tab-panels>
    </template>

    <EditRiddleModal v-model="modal" :riddle="editing" />
    <AppFooter />
  </div>
</template>
