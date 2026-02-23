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
        </v-row>
      </v-card-text>

      <v-card-actions class="pa-4">
        <v-spacer></v-spacer>
        <v-btn color="grey" variant="text" @click="$emit('update:modelValue', false)"
          >Cancelar</v-btn
        >
        <v-btn color="blue-darken-2" variant="elevated" @click="$emit('save', localItem)"
          >Guardar</v-btn
        >
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'

// 1. Definimos la forma del producto para que no haya errores
interface Product {
  id?: number | null
  name: string
  price: number
  stock: number
}

const props = defineProps<{
  modelValue: boolean
  item: Product // <--- Cambiamos unknown por Product
  isEdit: boolean
}>()

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const emit = defineEmits(['update:modelValue', 'save'])

// 2. Inicializamos con la interface
const localItem = ref<Product>({ ...props.item })

watch(
  () => props.item,
  (newVal) => {
    localItem.value = { ...newVal }
  },
)
</script>
