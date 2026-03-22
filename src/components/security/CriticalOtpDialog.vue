<template>
  <v-dialog v-model="model" max-width="400">
    <v-card class="pa-4">
      <v-card-title class="text-h6 d-flex align-center">
        <v-icon icon="mdi-shield-lock" class="me-2" />
        Verificación de seguridad
      </v-card-title>

      <v-card-text>
        Ingresa tu código de autenticación para continuar.
        
        <v-text-field
          v-model="codigo"
          label="Código OTP"
          maxlength="6"
          type="text"
          class="mt-3"
          autofocus
        />
      </v-card-text>

      <v-card-actions>
        <v-spacer />
        <v-btn text @click="cerrar">Cancelar</v-btn>
        <v-btn color="primary" @click="confirmar" :loading="loading">
          Confirmar
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { ref, watch } from "vue"

const props = defineProps<{
  modelValue: boolean
}>()

const emit = defineEmits(["update:modelValue", "success"])

const model = ref(props.modelValue)
const codigo = ref("")
const loading = ref(false)

watch(() => props.modelValue, (val) => model.value = val)
watch(model, (val) => emit("update:modelValue", val))

const cerrar = () => {
  codigo.value = ""
  model.value = false
}

const confirmar = async () => {
  if (!codigo.value) return

  loading.value = true

  emit("success", codigo.value)

  loading.value = false
  cerrar()
}
</script>