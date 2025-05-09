import * as yup from 'yup';

// Esquema de validación para perfil
export const profileSchema = yup.object().shape({
  name: yup
    .string()
    .required('El nombre es requerido')
    .min(1, 'El nombre debe tener al menos 1 carácter')
    .max(20, 'El nombre no puede tener más de 20 caracteres'),
  allowedRating: yup
    .string()
    .required('La clasificación es requerida')
    .oneOf(['KIDS', 'ADULTS'], 'Clasificación no válida')
});

// Esquema de validación para juego
export const gameSchema = yup.object().shape({
  name: yup
    .string()
    .required('El nombre es requerido')
    .min(1, 'El nombre debe tener al menos 1 carácter'),
  description: yup
    .string()
    .required('La descripción es requerida')
    .min(10, 'La descripción debe tener al menos 10 caracteres'),
  platforms: yup
    .array()
    .min(1, 'Debe seleccionar al menos una plataforma')
    .of(yup.string().required()),
  genres: yup
    .array()
    .min(1, 'Debe seleccionar al menos un género')
    .of(yup.string().required()),
  esrbRating: yup
    .string()
    .required('La clasificación ESRB es requerida')
    .oneOf(['E', 'E10+', 'T', 'M'], 'Clasificación ESRB no válida')
});

// Esquema de validación para usuario
export const userSchema = yup.object().shape({
  name: yup
    .string()
    .required('El nombre es requerido')
    .min(2, 'El nombre debe tener al menos 2 caracteres'),
  email: yup
    .string()
    .required('El email es requerido')
    .email('Por favor ingrese un email válido'),
  password: yup
    .string()
    .required('La contraseña es requerida')
    .min(6, 'La contraseña debe tener al menos 6 caracteres')
    .matches(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,}$/, 
      'Debe contener al menos una letra y un número'),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref('password')], 'Las contraseñas no coinciden')
});
