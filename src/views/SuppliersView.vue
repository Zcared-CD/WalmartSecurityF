<template>
  <v-app>
    <HeaderBar show-logout />
    <v-main class="bg-grey-lighten-4">
      <v-container>

        <v-row class="mb-5 align-center">
          <v-col>
            <v-btn
              variant="text"
              prepend-icon="mdi-arrow-left"
              class="mb-2"
              @click="router.push('/dashboard')"
            >
              Regresar
            </v-btn>
            <h1 class="text-h4 font-weight-bold text-blue-darken-4">Proveedores</h1>
            <p class="text-subtitle-1 text-grey-darken-1">
              Gestión de proveedores
            </p>
          </v-col>
          <v-col cols="auto">
            <v-btn
              color="blue-darken-2"
              prepend-icon="mdi-plus"
              size="large"
              @click="openCreateDialog"
            >
              Nuevo Proveedor
            </v-btn>
          </v-col>
        </v-row>

        <v-card flat class="mb-4 pa-4 rounded-lg">
          <v-text-field
            v-model="search"
            label="Buscar por nombre..."
            prepend-inner-icon="mdi-magnify"
            variant="outlined"
            density="compact"
            hide-details
          />
        </v-card>

        <v-card flat class="rounded-lg">
          <v-data-table
            :headers="headers"
            :items="suppliers"
            :search="search"
            class="elevation-0"
          >
            <template #item.actions="{ item }">
              <v-icon
                color="blue-darken-2"
                class="mr-2"
                @click="openEditDialog(item)"
              >
                mdi-pencil
              </v-icon>
              <v-icon
                color="red-darken-2"
                @click="openDeleteConfirm(item)"
              >
                mdi-delete
              </v-icon>
            </template>
          </v-data-table>
        </v-card>

      </v-container>
    </v-main>

    <!-- Dialog crear/editar -->
    <v-dialog v-model="dialog" max-width="400px">
      <v-card>
        <v-card-title class="text-h6 pa-4">
          {{ isEdit ? 'Editar Proveedor' : 'Nuevo Proveedor' }}
        </v-card-title>
        <v-card-text>
          <v-text-field
            v-model="form.name"
            label="Nombre del proveedor"
            variant="outlined"
            :error-messages="formError"
          />
        </v-card-text>
        <v-card-actions class="pa-4">
          <v-spacer />
          <v-btn text @click="dialog = false">Cancelar</v-btn>
          <v-btn color="blue-darken-2" variant="flat" @click="saveSupplier">
            Guardar
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Dialog confirmar eliminar -->
    <v-dialog v-model="dialogDelete" max-width="400px">
      <v-card>
        <v-card-title class="text-h6 pa-4">
          Eliminar Proveedor
        </v-card-title>
        <v-card-text>
          ¿Estás seguro que deseas eliminar a <strong>{{ form.name }}</strong>?
        </v-card-text>
        <v-card-actions class="pa-4">
          <v-spacer />
          <v-btn text @click="dialogDelete = false">Cancelar</v-btn>
          <v-btn color="red-darken-2" variant="flat" @click="confirmDelete">
            Eliminar
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <FooterBar />
  </v-app>
</template>

<script setup lang="ts">
import FooterBar from '@/components/layout/FooterBar.vue'
import HeaderBar from '@/components/layout/HeaderBar.vue'
import {
  createSupplier,
  deleteSupplier,
  getSuppliers,
  updateSupplier,
  type Supplier,
} from '@/services/suppliers'
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const search = ref('')
const dialog = ref(false)
const dialogDelete = ref(false)
const isEdit = ref(false)
const formError = ref('')
const suppliers = ref<Supplier[]>([])

const defaultForm = { supplier_id: '', name: '' }
const form = ref<Supplier>({ ...defaultForm })

const headers = [
  { title: 'ID', key: 'supplier_id' },
  { title: 'Nombre', key: 'name' },
  { title: 'Acciones', key: 'actions', sortable: false },
]

onMounted(async () => {
  await loadSuppliers()
})

async function loadSuppliers() {
  try {
    suppliers.value = await getSuppliers()
  } catch (error) {
    console.error(error)
  }
}

function openCreateDialog() {
  isEdit.value = false
  form.value = { ...defaultForm }
  formError.value = ''
  dialog.value = true
}

function openEditDialog(item: Supplier) {
  isEdit.value = true
  form.value = { ...item }
  formError.value = ''
  dialog.value = true
}

function openDeleteConfirm(item: Supplier) {
  form.value = { ...item }
  dialogDelete.value = true
}

async function confirmDelete() {
  try {
    await deleteSupplier(form.value.supplier_id)
    suppliers.value = suppliers.value.filter(s => s.supplier_id !== form.value.supplier_id)
    dialogDelete.value = false
  } catch (error) {
    console.error(error)
  }
}

async function saveSupplier() {
  formError.value = ''
  try {
    if (isEdit.value) {
      const updated = await updateSupplier(form.value.supplier_id, form.value.name)
      const index = suppliers.value.findIndex(s => s.supplier_id === updated.supplier_id)
      if (index !== -1) suppliers.value[index] = updated
    } else {
      const created = await createSupplier(form.value.name)
      suppliers.value.push(created)
    }
    dialog.value = false
  } catch (error: any) {
    formError.value = error.response?.data?.name?.[0] ?? 'Error al guardar'
  }
}
</script>