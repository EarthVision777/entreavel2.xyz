const messages = {
  home: "Inicio",
  feed: "Feed",
  community: "Comunidad",
  profile: "Perfil",
  back: "Volver",
  enter: "Entrar",
  entering: "Entrando...",
  close: "Cerrar",
  access_your_account: "Accede a tu cuenta",
  enter_your_email: "Tu Correo Electrónico:",
  please_enter_email: "Por favor, ingresa tu email",
  please_enter_valid_email: "Por favor, ingresa un correo electrónico válido",
  error_login: "Error al iniciar sesión",
  incorrect_email_no_access: "Email incorrecto o no tienes acceso a esta app",
  install_app: "Instalar App",
  install_app_ios: "Cómo instalar la app en tu iPhone",
  ios_install_step1:
    "Toca el ícono de compartir (el cuadrado con una flechita hacia arriba, en la parte inferior de la pantalla).",
  ios_install_step2:
    'Desliza hacia abajo y selecciona la opción "Agregar a pantalla de inicio".',
  ios_install_step3: 'Presiona "Agregar" en la esquina superior derecha.',
  notifications_enabled: "Notificaciones activadas",
  enable_notifications: "Activar notificaciones",
  no_products_available: "No hay productos disponibles",
  you_dont_have_access: "No tienes acceso a este producto",
  error_loading_products: "Error al cargar productos",
  error_loading_content: "Error al cargar contenido",
  this_product_will_be_released_in_one_day:
    "Este producto estará disponible en 1 día",
  this_product_will_be_released_in_days:
    "Este producto estará disponible en {{days}} días",
  this_product_will_be_released_on_date:
    "Este producto estará disponible el {{date}}",
  description: "Descripción",
  last_updated: "Última actualización:",
  open_lesson: "Si la clase no aparece, ábrela en una pestaña nueva",
  feed_updates: "Actualizaciones",
  no_posts_yet: "Aún no hay publicaciones",
  updates_will_appear_here: "Las actualizaciones aparecerán aquí",
  error_loading_feed: "Error al cargar el feed",
  what_are_you_thinking: "¿Qué estás pensando?",
  posting: "Publicando...",
  post: "Publicar",
  post_created_successfully: "¡Publicación creada con éxito!",
  error_creating_post: "Error al crear la publicación",
  error_liking_post: "Error al dar me gusta",
  error_loading_posts: "Error al cargar publicaciones",
  error_adding_comment: "Error al añadir el comentario",
  comment_added_successfully: "¡Comentario añadido con éxito!",
  no_comments_yet: "Aún no hay comentarios",
  write_a_comment: "Escribe un comentario...",
  no_posts_in_community: "Aún no hay publicaciones en la comunidad",
  be_the_first_to_post: "¡Sé el primero en compartir algo con la comunidad!",
  post_deleted_successfully: "¡Publicación eliminada con éxito!",
  comment_deleted_successfully: "¡Comentario eliminado con éxito!",
  error_deleting_post: "Error al eliminar la publicación",
  error_deleting_comment: "Error al eliminar el comentario",
  delete: "Eliminar",
  post_image: "Imagen de la publicación",
  your_profile: "Tu Perfil",
  logout: "Cerrar sesión",
  name: "Nombre",
  email: "Email",
  enter_profile_name: "Ingresa tu nombre",
  saving: "Guardando...",
  save: "Guardar",
  cancel: "Cancelar",
  name_not_defined: "Nombre no definido",
  edit: "Editar",
  name_updated_successfully: "¡Nombre actualizado con éxito!",
  error_updating_name: "Error al actualizar el nombre",
  update_app: "Actualizar app",
  updating_app: "Actualizando…",
  app_updated: "App actualizada a la última versión",
  login_hint:
    "Cualquier correo entra. En esta copia de prueba todos ven el mismo contenido.",
} as const;

export type MessageKey = keyof typeof messages;

export function t(
  key: MessageKey,
  vars?: Record<string, string | number>,
): string {
  let text: string = messages[key];
  if (vars) {
    for (const [name, value] of Object.entries(vars)) {
      text = text.replaceAll(`{{${name}}}`, String(value));
    }
  }
  return text;
}
