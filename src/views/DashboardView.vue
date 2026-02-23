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
import { ref } from 'vue'
import HeaderBar from '@/components/layout/HeaderBar.vue'
import FooterBar from '@/components/layout/FooterBar.vue'
import ProductTable from '@/components/dashboard/ProductTable.vue'
import ProductDialog from '@/components/dashboard/ProductDialog.vue'
import DeleteConfirm from '@/components/dashboard/DeleteConfirm.vue'

// --- TypeScript Interface ---
interface Product {
  id: number | null
  name: string
  price: number
  stock: number
}

// --- Estado ---
const search = ref('')
const dialogForm = ref(false)
const dialogDelete = ref(false)
const isEdit = ref(false)

const defaultItem: Product = { id: null, name: '', price: 0, stock: 0 }
const editedItem = ref<Product>({ ...defaultItem })

// Datos de prueba (Luego vendrán de tu microservicio SOAP)
const products = ref<Product[]>([
  { id: 101, name: 'Leche Deslactosada 1L', price: 25.5, stock: 50 },
  { id: 102, name: 'Pan Tajado Familiar', price: 4.2, stock: 3 },
  { id: 103, name: 'Detergente en Polvo 5kg', price: 15.9, stock: 12 },
])

// --- Funciones de Lógica ---

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

const saveProduct = (productData: Product) => {
  if (isEdit.value) {
    // Lógica para actualizar
    const index = products.value.findIndex((p) => p.id === productData.id)
    if (index !== -1) products.value[index] = productData
  } else {
    // Lógica para crear (Generamos ID temporal)
    const newProduct = { ...productData, id: Math.floor(Math.random() * 1000) }
    products.value.push(newProduct)
  }
  dialogForm.value = false
}

const deleteProduct = () => {
  products.value = products.value.filter((p) => p.id !== editedItem.value.id)
  dialogDelete.value = false
}
</script>
