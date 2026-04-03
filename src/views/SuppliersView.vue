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
            <p class="text-subtitle-1 text-grey-darken-1">Gestión de proveedores</p>
          </v-col>
          <v-col cols="auto">
            <v-btn
              v-if="puedeEditar"
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
          <v-data-table :headers="headers" :items="suppliers" :search="search" class="elevation-0">
            <template #item.actions="{ item }">
              <v-icon
                v-if="puedeEditar"
                color="blue-darken-2"
                class="mr-2"
                @click="openEditDialog(item)"
              >
                mdi-pencil
              </v-icon>
              <v-icon v-if="puedeEliminar" color="red-darken-2" @click="openDeleteConfirm(item)">
                mdi-delete
              </v-icon>
            </template>
          </v-data-table>
        </v-card>
      </v-container>
    </v-main>

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
            :error-messages="nameErrors.length ? nameErrors : formError"
            counter="16"
            hint="Mínimo 4, máximo 16 caracteres"
            persistent-hint
          />
        </v-card-text>
        <v-card-actions class="pa-4">
          <v-spacer />
          <v-btn text @click="dialog = false">Cancelar</v-btn>
          <v-btn color="blue-darken-2" variant="flat" @click="saveSupplier"  :disabled="nameErrors.length > 0 || !form.name.trim()">
            Guardar
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog v-model="dialogDelete" max-width="400px">
      <v-card>
        <v-card-title class="text-h6 pa-4">Eliminar Proveedor</v-card-title>
        <v-card-text>
          ¿Estás seguro que deseas eliminar a <strong>{{ form.name }}</strong
          >?
        </v-card-text>

        <v-alert
          v-if="deleteError"
          type="error"
          variant="tonal"
          class="mx-4 mb-2"
          density="compact"
        >
          {{ deleteError }}
        </v-alert>
        <v-card-actions class="pa-4">
          <v-spacer />
          <v-btn text @click="dialogDelete = false">Cancelar</v-btn>
          <v-btn color="red-darken-2" variant="flat" @click="confirmDelete"> Eliminar </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <CriticalOtpDialog v-model="otpDialog" @success="handleOtpSuccess" />

    <FooterBar />
  </v-app>
</template>

<script setup lang="ts">
import FooterBar from '@/components/layout/FooterBar.vue'
import HeaderBar from '@/components/layout/HeaderBar.vue'
import CriticalOtpDialog from '@/components/security/CriticalOtpDialog.vue'
import { verifyCritical } from '@/services/auth'
import { getMiRol } from '@/services/inventory'
import {
  createSupplier,
  deleteSupplier,
  getSuppliers,
  updateSupplier,
  type Supplier,
} from '@/services/suppliers'
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const search = ref('')
const dialog = ref(false)
const dialogDelete = ref(false)
const isEdit = ref(false)
const formError = ref('')
const deleteError = ref('')
const suppliers = ref<Supplier[]>([])

const userRol = ref({
  is_admin: false,
  is_gerente: false,
  is_empleado: false,
})
const puedeEditar = computed(() => userRol.value.is_admin || userRol.value.is_gerente)
const puedeEliminar = computed(() => userRol.value.is_admin)
const nameErrors = computed(() => {
  const val = form.value.name

  if (!val) return []

  if (val.length < 4) {
    return ['El nombre debe tener al menos 4 caracteres.']
  }

  if (val.length > 16) {
    return ['El nombre no puede tener más de 16 caracteres.']
  }

  if (val !== val.trim()) {
    return ['Formatos incorrectos.']
  }

  if (!/^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑüÜ\s]+$/.test(val)) {
    return ['Solo se permiten letras y numeros']
  }

  if (/^\d+$/.test(val.trim())) {
    return ['El nombre no puede ser solo números.']
  }

  return []
})

const otpDialog = ref(false)
let pendingAction: null | ((token?: string) => Promise<void>) = null

const defaultForm = { supplier_id: '', name: '' }
const form = ref<Supplier>({ ...defaultForm })

const headers = [
  { title: 'ID', key: 'supplier_id' },
  { title: 'Nombre', key: 'name' },
  { title: 'Acciones', key: 'actions', sortable: false },
]

onMounted(async () => {
  try {
    const rol = await getMiRol()
    userRol.value = rol
  } catch (e) {
    console.error(e)
  }
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
  deleteError.value = ''
  dialogDelete.value = true
}

async function confirmDelete() {
  deleteError.value = ''
  pendingAction = async (token?: string) => {
    if (!token) return
    try {
      await deleteSupplier(form.value.supplier_id, token)
      suppliers.value = suppliers.value.filter((s) => s.supplier_id !== form.value.supplier_id)
      dialogDelete.value = false
    } catch (error: any) {
      if (error.response?.status === 400) {
        deleteError.value = error.response.data?.error ?? 'No se puede eliminar este proveedor.'
      } else {
        deleteError.value = 'Error al eliminar el proveedor.'
      }
    }
  }
  otpDialog.value = true
}

async function saveSupplier() {
  formError.value = ''

  const nombre = form.value.name.trim().slice(0, 16)
  if (!nombre) {
    formError.value = 'El nombre no puede estar vacío.'
    return
  }

  if (isEdit.value) {
    const id = form.value.supplier_id
    pendingAction = async (token?: string) => {
      if (!token) return
      try {
        const updated = await updateSupplier(id, nombre, token)
        const index = suppliers.value.findIndex((s) => s.supplier_id === updated.supplier_id)
        if (index !== -1) suppliers.value[index] = updated
        dialog.value = false
      } catch (error: any) {
        formError.value = error.response?.data?.name?.[0] ?? 'Error al guardar.'
      }
    }
    otpDialog.value = true
  } else {
    try {
      const created = await createSupplier(nombre)
      suppliers.value.push(created)
      dialog.value = false
    } catch (error: any) {
      formError.value = error.response?.data?.name?.[0] ?? 'Error al guardar.'
    }
  }
}

async function handleOtpSuccess(codigo: string) {
  if (!pendingAction) return
  try {
    const token = await verifyCritical(codigo)
    await pendingAction(token)
  } catch {
    alert('Código inválido')
    return
  }
  pendingAction = null
  otpDialog.value = false
}
</script>
