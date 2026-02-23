<template>
  <v-dialog
    :model-value="modelValue"
    @update:model-value="$emit('update:modelValue', $event)"
    max-width="400px"
  >
    <v-card class="pa-2">
      <v-card-title class="text-h5 d-flex align-center">
        <v-icon color="warning" icon="mdi-alert" class="me-2"></v-icon>
        Confirmar eliminación
      </v-card-title>

      <v-card-text class="py-4 text-body-1">
        ¿Estás seguro de que deseas eliminar el producto:
        <span class="font-weight-bold">"{{ productName }}"</span>? Esta acción no se puede deshacer.
      </v-card-text>

      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn color="grey-darken-1" variant="text" @click="$emit('update:modelValue', false)">
          Cancelar
        </v-btn>
        <v-btn color="red-darken-1" variant="elevated" @click="$emit('confirm')">
          Sí, eliminar
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
defineProps<{
  modelValue: boolean
  productName: string
}>()

defineEmits(['update:modelValue', 'confirm'])
</script>
