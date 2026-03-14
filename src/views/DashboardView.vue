<template>
  <v-app>
    <HeaderBar show-logout />
    <v-main class="bg-grey-lighten-4">
      <v-container>
        <v-row class="mb-5 align-center">
          <v-col>
            <h1 class="text-h4 font-weight-bold text-blue-darken-4">Inventario de Productos</h1>
            <p class="text-subtitle-1 text-grey-darken-1">
              Panel de administración de microservicios
            </p>
          </v-col>
          <v-col cols="auto">
            <v-btn
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

    <FooterBar />
  </v-app>
</template>

<script setup lang="ts">
// Imports
// Utilidades de Vue
import { ref, onMounted } from 'vue'

// Servicios que conectan con la API
import {
  getProducts,
  createProduct,
  updateProduct,
  deleteProduct as apiDeleteProduct,
} from '@/services/inventory'

// Componentes de la vista
import HeaderBar from '@/components/layout/HeaderBar.vue'
import FooterBar from '@/components/layout/FooterBar.vue'
import ProductTable from '@/components/dashboard/ProductTable.vue'
import ProductDialog from '@/components/dashboard/ProductDialog.vue'
import DeleteConfirm from '@/components/dashboard/DeleteConfirm.vue'

// Interface del producto que usa el frontend
interface Product {
  id: string | null
  name: string
  price: number
  stock: number
}

// Estado reactivo de la vista
const search = ref('')
const dialogForm = ref(false)
const dialogDelete = ref(false)
const isEdit = ref(false)

const products = ref<Product[]>([])

// Producto base para limpiar o iniciar formularios
const defaultItem: Product = {
  id: null,
  name: '',
  price: 0,
  stock: 0,
}

const editedItem = ref<Product>({ ...defaultItem })

// Carga inicial de productos desde la API
onMounted(async () => {
  const data = await getProducts()

  products.value = data.map((p: any) => ({
    id: p.item_id,
    name: p.product_name,
    price: p.unit_price,
    stock: p.quantity_in_stock,
  }))
})

// Vista de crear producto
const openCreateDialog = () => {
  isEdit.value = false
  editedItem.value = { ...defaultItem }
  dialogForm.value = true
}

// Vista de editar producto
const openEditDialog = (item: Product) => {
  isEdit.value = true
  editedItem.value = { ...item }
  dialogForm.value = true
}

// Vista de confirmación para eliminar
const openDeleteConfirm = (item: Product) => {
  editedItem.value = { ...item }
  dialogDelete.value = true
}

// Guarda producto
const saveProduct = async (productData: Product) => {
  // edita
  if (isEdit.value) {
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
  }

  // crea
  else {
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
  }

  dialogForm.value = false
}

// elimina
const deleteProduct = async () => {
  if (editedItem.value.id) {
    await apiDeleteProduct(editedItem.value.id)
  }

  products.value = products.value.filter((p) => p.id !== editedItem.value.id)

  dialogDelete.value = false
}
</script>
