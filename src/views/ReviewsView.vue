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
            <h1 class="text-h4 font-weight-bold text-blue-darken-4">Reseñas de Productos</h1>
            <p class="text-subtitle-1 text-grey-darken-1">Observaciones del inventario</p>
          </v-col>
          <v-col cols="auto">
            <v-btn
              color="orange-darken-2"
              prepend-icon="mdi-plus"
              size="large"
              @click="openCreateDialog"
            >
              Nueva Reseña
            </v-btn>
          </v-col>
        </v-row>

        <v-card flat class="mb-4 pa-4 rounded-lg">
          <v-text-field
            v-model="search"
            label="Buscar por producto o comentario..."
            prepend-inner-icon="mdi-magnify"
            variant="outlined"
            density="compact"
            hide-details
          />
        </v-card>

        <v-card flat class="rounded-lg">
          <v-data-table :headers="headers" :items="reviews" :search="search" class="elevation-0">
            <template #item.rating="{ item }">
              <span
                v-for="star in 5"
                :key="star"
                :style="{ color: star <= item.rating ? '#FFA000' : '#BDBDBD', fontSize: '18px' }"
                >★</span
              >
            </template>

            <template #item.reviewed_at="{ item }">
              {{ new Date(item.reviewed_at).toLocaleDateString('es-MX') }}
            </template>

            <template #item.actions="{ item }">
              <v-icon
                v-if="puedeEditar"
                color="blue-darken-2"
                class="mr-2"
                @click="openEditDialog(item)"
              >
                mdi-pencil
              </v-icon>

              <v-icon
                v-if="puedeEliminar"
                color="red-darken-2"
                @click="openDeleteConfirm(item)"
              >
                mdi-delete
              </v-icon>
            </template>
          </v-data-table>
        </v-card>
      </v-container>
    </v-main>

    <!-- Dialog crear/editar -->
    <v-dialog v-model="dialog" max-width="500px">
      <v-card>
        <v-card-title class="text-h6 pa-4">
          {{ isEdit ? 'Editar Reseña' : 'Nueva Reseña' }}
        </v-card-title>
        <v-card-text class="d-flex flex-column gap-3">
          <v-select
            v-if="!isEdit"
            v-model="form.item"
            :items="products"
            item-title="product_name"
            item-value="item_id"
            label="Producto"
            variant="outlined"
            :error-messages="formErrors.item"
          />

          <div>
            <p class="text-body-2 mb-1">Calificación</p>
            <span
              v-for="star in 5"
              :key="star"
              style="font-size: 28px; cursor: pointer"
              :style="{ color: star <= form.rating ? '#FFA000' : '#BDBDBD' }"
              @click="form.rating = star"
              >★</span
            >
            <p v-if="formErrors.rating" class="text-red text-caption mt-1">
              {{ formErrors.rating }}
            </p>
          </div>

          <v-textarea
            v-model="form.comment"
            label="Comentario"
            variant="outlined"
            rows="3"
            @paste.prevent="handlePasteReview"
            @input="formErrors.comment = ''"
            :error-messages="formErrors.comment"
          />
        </v-card-text>
        <v-card-actions class="pa-4">
          <v-spacer />
          <v-btn text @click="dialog = false">Cancelar</v-btn>
          <v-btn color="orange-darken-2" variant="flat" @click="saveReview"> Guardar </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Dialog confirmar eliminar -->
    <v-dialog v-model="dialogDelete" max-width="400px">
      <v-card>
        <v-card-title class="text-h6 pa-4">Eliminar Reseña</v-card-title>
        <v-card-text>
          ¿Estás seguro que deseas eliminar la reseña de <strong>{{ form.product_name }}</strong
          >?
        </v-card-text>
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
import { getProducts, type Product } from '@/services/inventory'
import {
  createReview,
  deleteReview,
  getReviews,
  updateReview,
  type Review,
} from '@/services/reviews'
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { getMiRol } from '@/services/inventory'
import { computed } from 'vue'

const router = useRouter()
const search = ref('')
const dialog = ref(false)
const dialogDelete = ref(false)
const isEdit = ref(false)
const reviews = ref<Review[]>([])
const products = ref<Product[]>([])
const otpDialog = ref(false)
let pendingAction: null | ((token?: string) => Promise<void>) = null
let pasteAttemptsReview = 0


const formErrors = ref({ item: '', rating: '', comment: '' })


const handlePasteReview = (e: ClipboardEvent) => {
  e.preventDefault()
  pasteAttemptsReview++

  if (!formErrors.value.comment) {
    formErrors.value.comment = "Por seguridad no se permite pegar"
  }

  if (pasteAttemptsReview >= 3 && !import.meta.env.PROD) {
    console.warn("Posible automatización en reviews")
  }
}


const defaultForm = {
  review_id: '',
  item: '',
  product_name: '',
  rating: 0,
  comment: '',
  reviewed_at: '',
}
const form = ref<Review>({ ...defaultForm })

const userRol = ref({
  is_admin: false,
  is_gerente: false,
  is_empleado: false,
  roles: [] as string[],
})

const puedeEditar = computed(() => userRol.value.is_admin || userRol.value.is_gerente)
const puedeEliminar = computed(() => userRol.value.is_admin)

const headers = [
  { title: 'Producto', key: 'product_name' },
  { title: 'Calificación', key: 'rating', sortable: true },
  { title: 'Comentario', key: 'comment' },
  { title: 'Fecha', key: 'reviewed_at' },
  { title: 'Acciones', key: 'actions', sortable: false },
]

onMounted(async () => {
  try {
    const rol = await getMiRol()
    userRol.value = rol

    await loadReviews()
    await loadProducts()
  } catch (error) {
    console.error(error)
  }
})

async function loadReviews() {
  try {
    reviews.value = await getReviews()
  } catch (error) {
    console.error(error)
  }
}

async function loadProducts() {
  try {
    const data = await getProducts()
    products.value = data
  } catch (error) {
    console.error(error)
  }
}

function openCreateDialog() {
  pasteAttemptsReview = 0 
  isEdit.value = false
  form.value = { ...defaultForm }
  formErrors.value = { item: '', rating: '', comment: '' }
  dialog.value = true
}

function openEditDialog(item: Review) {
  isEdit.value = true
  form.value = { ...item }
  formErrors.value = { item: '', rating: '', comment: '' }
  dialog.value = true
}

function openDeleteConfirm(item: Review) {
  form.value = { ...item }
  dialogDelete.value = true
}

async function confirmDelete() {
  const id = form.value.review_id

  pendingAction = async (token?: string) => {
    if (!token) return

    await deleteReview(id, token)

    reviews.value = reviews.value.filter(
      (r) => r.review_id !== id
    )

    dialogDelete.value = false
  }

  otpDialog.value = true
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

async function saveReview() {
  pasteAttemptsReview = 0 
  formErrors.value = { item: '', rating: '', comment: '' }
  let valid = true

  if (!isEdit.value && !form.value.item) {
    formErrors.value.item = 'Selecciona un producto'
    valid = false
  }
  if (!form.value.rating || form.value.rating < 1) {
    formErrors.value.rating = 'Selecciona una calificación'
    valid = false
  }
  if (!form.value.comment || form.value.comment.trim().length < 3) {
    formErrors.value.comment = 'El comentario debe tener al menos 3 caracteres'
    valid = false
  }

  if (!valid) return

  try {
    if (isEdit.value) {
      const id = form.value.review_id
      pendingAction = async (token?: string) => {
        if (!token) return

        const updated = await updateReview(
          id,
          {
            rating: form.value.rating,
            comment: form.value.comment,
          },
          token
        )

        const index = reviews.value.findIndex((r) => r.review_id === updated.review_id)
        if (index !== -1) reviews.value[index] = updated

        dialog.value = false
      }

      otpDialog.value = true
      return
    } else {
      const created = await createReview({
        item: form.value.item,
        rating: form.value.rating,
        comment: form.value.comment,
      })
      reviews.value.push(created)
    }
    dialog.value = false
  } catch (error: any) {
    const data = error.response?.data
    if (data?.comment) formErrors.value.comment = data.comment[0]
    if (data?.rating) formErrors.value.rating = data.rating[0]
    if (data?.item) formErrors.value.item = data.item[0]
  }
}
</script>