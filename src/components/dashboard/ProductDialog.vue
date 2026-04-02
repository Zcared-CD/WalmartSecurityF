<template>
  <v-dialog
    :model-value="modelValue"
    @update:model-value="$emit('update:modelValue', $event)"
    max-width="500px"
  >
    <v-card>
      <v-card-title class="pa-4 bg-blue-darken-2 text-white">
        <span class="text-h6">{{ isEdit ? 'Editar Producto' : 'Nuevo Producto' }}</span>
      </v-card-title>

      <v-card-text class="mt-4">
        <v-row>
          <v-col cols="12">
            <v-text-field
              v-model="localItem.name"
              label="Nombre"
              variant="outlined"
              density="compact"
            ></v-text-field>
          </v-col>
          <v-col cols="6">
            <v-text-field
              v-model="localItem.price"
              label="Precio"
              prefix="$"
              type="number"
              variant="outlined"
              density="compact"
            ></v-text-field>
          </v-col>
          <v-col cols="6">
            <v-text-field
              v-model="localItem.stock"
              label="Stock"
              type="number"
              variant="outlined"
              density="compact"
            ></v-text-field>
          </v-col>


          <v-col cols="12">
            <v-select
              v-model="localItem.supplier"
              :items="suppliers"
              item-title="name"
              item-value="supplier_id"
              label="Proveedor"
              variant="outlined"
              density="compact"
              :rules="[v => !!v || 'El proveedor es obligatorio']"
            ></v-select>
          </v-col>

        </v-row>
      </v-card-text>

      <v-card-actions class="pa-4">
        <v-spacer></v-spacer>
        <v-btn color="grey" variant="text" @click="$emit('update:modelValue', false)">
          Cancelar
        </v-btn>
        <v-btn color="blue-darken-2" variant="elevated" @click="handleSave">
          Guardar
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import type { Supplier } from '@/services/suppliers'
import { ref, watch } from 'vue'


interface Product {
  id: string | null
  name: string
  price: number
  stock: number
  supplier: string
  supplier_name: string
}


const props = defineProps<{
  modelValue: boolean
  item: Product
  isEdit: boolean
  suppliers: Supplier[]
}>()

const emit = defineEmits(['update:modelValue', 'save'])

const localItem = ref<Product>({ ...props.item })

watch(
  () => props.item,
  (newVal) => {
    localItem.value = { ...newVal }
  },
)


const handleSave = () => {
  const sanitized: Product = {
    ...localItem.value,
    name: localItem.value.name.trim().slice(0, 255),
    price: Math.max(0.01, Math.min(100000, Number(localItem.value.price))),
    stock: Math.max(0, Math.min(200, Math.floor(Number(localItem.value.stock)))),
    supplier: localItem.value.supplier,
    supplier_name: localItem.value.supplier_name,
  }
  emit('save', sanitized)
}
</script>
