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

      <v-btn
        v-if="puedeEditar"
        icon="mdi-pencil"
        variant="text"
        color="blue"
        @click="$emit('edit', item)"
      ></v-btn>


      <v-btn
        v-if="puedeEliminar"
        icon="mdi-delete"
        variant="text"
        color="red"
        @click="$emit('delete', item)"
      ></v-btn>
    </template>
  </v-data-table>
</template>

<script setup lang="ts">
defineProps<{
  products: unknown[]
  search: string
  puedeEditar: boolean
  puedeEliminar: boolean
}>()

defineEmits(['edit', 'delete'])

const headers = [
  { title: 'ID', key: 'id', align: 'start' as const },
  { title: 'Producto', key: 'name', align: 'start' as const },
  { title: 'Precio ($)', key: 'price', align: 'end' as const },
  { title: 'Stock', key: 'stock', align: 'center' as const },
  { title: 'Acciones', key: 'actions', sortable: false, align: 'end' as const },
]
</script>
