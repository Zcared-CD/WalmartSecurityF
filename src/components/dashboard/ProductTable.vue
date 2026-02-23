<!-- eslint-disable vue/valid-v-slot -->
<template>
  <v-data-table
    :headers="headers"
    :items="products"
    :search="search"
    hover
    class="elevation-1 rounded-lg"
  >
    <template v-slot:item.stock="{ value }">
      <v-chip :color="value < 5 ? 'red' : 'green'" size="small" variant="flat">
        {{ value }} uds
      </v-chip>
    </template>

    <template v-slot:item.actions="{ item }">
      <v-btn icon="mdi-pencil" variant="text" color="blue" @click="$emit('edit', item)"></v-btn>
      <v-btn icon="mdi-delete" variant="text" color="red" @click="$emit('delete', item)"></v-btn>
    </template>
  </v-data-table>
</template>

<script setup lang="ts">
// 1. Definimos las Props
defineProps<{
  products: unknown[]
  search: string
}>()

// 2. Definimos los Eventos
defineEmits(['edit', 'delete'])

// 3. DEFINIMOS LOS HEADERS (Esto es lo que te faltaba y por eso marcaba error)
const headers = [
  { title: 'ID', key: 'id', align: 'start' as const },
  { title: 'Producto', key: 'name', align: 'start' as const },
  { title: 'Precio ($)', key: 'price', align: 'end' as const },
  { title: 'Stock', key: 'stock', align: 'center' as const },
  { title: 'Acciones', key: 'actions', sortable: false, align: 'end' as const },
]
</script>
