<template>
  <v-app>
    <HeaderBar show-logout />
    <v-main class="bg-grey-lighten-4">
      <v-container>


        <v-alert
          v-if="sinAcceso"
          type="error"
          variant="tonal"
          class="mb-4"
        >
          No tienes permisos para acceder al inventario.
        </v-alert>

        <v-row class="mb-5 align-center">
          <v-col>
            <h1 class="text-h4 font-weight-bold text-blue-darken-4">Inventario de Productos</h1>
            <p class="text-subtitle-1 text-grey-darken-1">
              Panel de administración de microservicios
            </p>
          </v-col>
          <v-col cols="auto" class="d-flex gap-2">
  <v-btn
    color="teal-darken-2"
    prepend-icon="mdi-truck"
    size="large"
    class="mr-2"
    @click="router.push('/suppliers')"
  >
    Proveedores
  </v-btn>
  <v-btn
    v-if="puedeEditar"
    color="blue-darken-2"
    prepend-icon="mdi-plus"
    size="large"
    @click="openCreateDialog"
  >
    Nuevo Producto
  </v-btn>
</v-col>
        </v-row>

        <v-card flat class="mb-4 pa-4 rounded-lg">
          <v-text-field
            v-model="search"
            label="Buscar por nombre o ID..."
            prepend-inner-icon="mdi-magnify"
            variant="outlined"
            density="compact"
            hide-details
          ></v-text-field>
        </v-card>

        <ProductTable
          :products="products"
          :search="search"
          :puede-editar="puedeEditar"
          :puede-eliminar="puedeEliminar"
          @edit="openEditDialog"
          @delete="openDeleteConfirm"
        />
      </v-container>
    </v-main>

    <ProductDialog v-model="dialogForm" :item="editedItem" :is-edit="isEdit" @save="saveProduct" />

    <DeleteConfirm
      v-model="dialogDelete"
      :product-name="editedItem.name"
      @confirm="deleteProduct"
    />

    <CriticalOtpDialog
      v-model="otpDialog"
      @success="handleOtpSuccess"
    />

    <v-dialog v-model="dialogInactividad" persistent max-width="450">
      <v-card>
        <v-card-title class="bg-warning text-white d-flex align-center">
          <v-icon start class="mr-2">mdi-alert</v-icon>
          Aviso de Inactividad
        </v-card-title>
        <v-card-text class="pt-4 pb-5 text-body-1">
          Tu sesión está a punto de expirar por inactividad.
        </v-card-text>
      </v-card>
    </v-dialog>

    <FooterBar />
  </v-app>
</template>

<script setup lang="ts">
import DeleteConfirm from '@/components/dashboard/DeleteConfirm.vue'
import ProductDialog from '@/components/dashboard/ProductDialog.vue'
import ProductTable from '@/components/dashboard/ProductTable.vue'
import FooterBar from '@/components/layout/FooterBar.vue'
import HeaderBar from '@/components/layout/HeaderBar.vue'
import CriticalOtpDialog from '@/components/security/CriticalOtpDialog.vue'
import { verifyCritical } from "@/services/auth"

import { useRouter } from 'vue-router'
import { reset as resetSession, logoutUser } from '@/services/sessionTimeout'
import {
  deleteProduct as apiDeleteProduct,
  createProduct,
  getMiRol,
  getProducts,
  updateProduct,
} from '@/services/inventory'
import { computed, onMounted, onUnmounted, ref } from 'vue'

interface Product {
  id: string | null
  name: string
  price: number
  stock: number
}

const search = ref('')
const dialogForm = ref(false)
const dialogDelete = ref(false)
const isEdit = ref(false)
const sinAcceso = ref(false)
const products = ref<Product[]>([])

const otpDialog = ref(false)
let pendingAction: null | ((token?: string) => Promise<void>) = null

const userRol = ref({ is_admin: false, is_gerente: false, is_empleado: false, roles: [] as string[] })


const puedeEditar = computed(() => userRol.value.is_admin || userRol.value.is_gerente)
const puedeEliminar = computed(() => userRol.value.is_admin)

const defaultItem: Product = { id: null, name: '', price: 0, stock: 0 }
const editedItem = ref<Product>({ ...defaultItem })

const router = useRouter()
const dialogInactividad = ref(false)

const mostrarAdvertencia = () => {
  dialogInactividad.value = true
}

const forzarCierreUI = () => {
  dialogInactividad.value = false
  localStorage.removeItem('token')
  router.push('/login')
}

const ocultarAdvertencia = () => {
  dialogInactividad.value = false
}

onMounted(async () => {
  window.addEventListener("show-logout-warning", mostrarAdvertencia)
  window.addEventListener("hide-logout-warning", ocultarAdvertencia)
  window.addEventListener("force-logout", forzarCierreUI)
  try {

    const rol = await getMiRol()
    userRol.value = rol


    if (rol.roles.length === 0) {
      sinAcceso.value = true
      return
    }

    const data = await getProducts()
    products.value = data.map((p: any) => ({
      id: p.item_id,
      name: p.product_name,
      price: p.unit_price,
      stock: p.quantity_in_stock,
    }))

  } catch (error: any) {
    if (error.message === 'SIN_PERMISO') {
      sinAcceso.value = true
    }
  }
})

const openCreateDialog = () => {
  isEdit.value = false
  editedItem.value = { ...defaultItem }
  dialogForm.value = true
}

const openEditDialog = (item: Product) => {
  isEdit.value = true
  editedItem.value = { ...item }
  dialogForm.value = true
}

const openDeleteConfirm = (item: Product) => {
  editedItem.value = { ...item }
  dialogDelete.value = true
}

const saveProduct = async (productData: Product) => {

  if (isEdit.value) {


    const original = products.value.find(p => p.id === productData.id)


    const esCritico = original && esCambioCritico(original, productData)

    if (esCritico) {

      const id = productData.id as string
      const data = {
        product_name: productData.name,
        unit_price: productData.price,
        quantity_in_stock: productData.stock,
      }

      pendingAction = async (token?: string) => {
        if (!token) return

        const updated = await updateProduct(id, data, token)

        const index = products.value.findIndex((p) => p.id === id)
        if (index !== -1) {
          products.value[index] = {
            id: updated.item_id,
            name: updated.product_name,
            price: updated.unit_price,
            stock: updated.quantity_in_stock,
          }
        }

        dialogForm.value = false
      }

      otpDialog.value = true
      return
    }

    try {
      const updated = await updateProduct(productData.id as string, {
        product_name: productData.name,
        unit_price: productData.price,
        quantity_in_stock: productData.stock,
      })

      const index = products.value.findIndex((p) => p.id === productData.id)
      if (index !== -1) {
        products.value[index] = {
          id: updated.item_id,
          name: updated.product_name,
          price: updated.unit_price,
          stock: updated.quantity_in_stock,
        }
      }

      dialogForm.value = false

    } catch (error: any) {


      if (
        error.response?.status === 403 &&
        error.response?.data?.error === "Requiere verificación crítica"
      ) {

        const id = productData.id as string
        const data = {
          product_name: productData.name,
          unit_price: productData.price,
          quantity_in_stock: productData.stock,
        }

        pendingAction = async (token?: string) => {
          if (!token) return

          const updated = await updateProduct(id, data, token)

          const index = products.value.findIndex((p) => p.id === id)
          if (index !== -1) {
            products.value[index] = {
              id: updated.item_id,
              name: updated.product_name,
              price: updated.unit_price,
              stock: updated.quantity_in_stock,
            }
          }

          dialogForm.value = false
        }

        otpDialog.value = true

      } else if (error.message === 'SIN_PERMISO') {
        alert('No tienes permisos para realizar esta acción')
      } else {
        console.error(error)
      }
    }

  } else {


    try {
      const created = await createProduct({
        product_name: productData.name,
        unit_price: productData.price,
        quantity_in_stock: productData.stock,
      })

      products.value.push({
        id: created.item_id,
        name: created.product_name,
        price: created.unit_price,
        stock: created.quantity_in_stock,
      })

      dialogForm.value = false

    } catch (error: any) {
      if (error.message === 'SIN_PERMISO') {
        alert('No tienes permisos para realizar esta acción')
      } else {
        console.error(error)
      }
    }
  }
}

const handleOtpSuccess = async (codigo: string) => {
  if (!pendingAction) return

  try {
    const token = await verifyCritical(codigo)

    await pendingAction(token)

  } catch (err) {
    alert("Código inválido")
    return
  }

  pendingAction = null
  otpDialog.value = false
}

const deleteProduct = async () => {
  const id = editedItem.value.id
  if (!id) return


  pendingAction = async (token?: string) => {
    if (!token) return

    await apiDeleteProduct(id, token)

    products.value = products.value.filter((p) => p.id !== id)
    dialogDelete.value = false
  }

  otpDialog.value = true
}

const esCambioCritico = (original: Product, nuevo: Product) => {

  if (original.price !== nuevo.price) {
    return true
  }


  const diferencia = Math.abs(original.stock - nuevo.stock)
  if (diferencia >= 20) {
    return true
  }

  return false
}

onUnmounted(() => {
  window.removeEventListener("show-logout-warning", mostrarAdvertencia)
  window.removeEventListener("hide-logout-warning", ocultarAdvertencia)
  window.removeEventListener("force-logout", forzarCierreUI)
})

</script>
