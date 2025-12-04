
SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

CREATE DATABASE IF NOT EXISTS `tesis` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;
USE `tesis`;


--
-- Table structure for table `alumnos`
--

CREATE TABLE `alumnos` (
  `id_alumnos` int NOT NULL,
  `nombre` varchar(50) NOT NULL,
  `apellido` varchar(50) NOT NULL,
  `DNI` varchar(15) NOT NULL,
  `anio` int DEFAULT NULL,
  `division` varchar(10) DEFAULT NULL,
  `email` varchar(100) DEFAULT NULL,
  `password` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `alumnos`
--

INSERT INTO `alumnos` (`id_alumnos`, `nombre`, `apellido`, `DNI`, `anio`, `division`, `email`, `password`) VALUES
(1, 'Noemy', 'Lopez', '34567123', 5, 'Quinta', 'koki@gmail.com', '$2y$10$o.x4KlT2kaTk07CgtdrK2eIplAlg/ewP7B18G5pzg.gbIJjmr3CiS'),
(2, 'Juan', 'Pérez', '12345678', 3, 'Primera', 'juan.perez@test.com', '$2y$10$kMvHTAnUzSDvp9OGTpiM5ukO9FP9TG13dBUIYiHXFLx81uIN3fl2u'),
(3, 'Maria', 'López', '87654321', 1, 'Primera', 'pruebaM@gmail.com', '$2y$10$B4LYaB7f1duNDKeXyT/PgeG3FeC4q6W/PJt36l3uV2rzaEBip4I7a');

-- --------------------------------------------------------

--
-- Table structure for table `alumnos_eventos`
--

CREATE TABLE `alumnos_eventos` (
  `id_alumnos` int NOT NULL,
  `id_evento` int NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `alumnos_eventos`
--

INSERT INTO `alumnos_eventos` (`id_alumnos`, `id_evento`) VALUES
(2, 1),
(2, 2),
(3, 3),
(3, 4),
(3, 5);

-- --------------------------------------------------------

--
-- Table structure for table `alumnos_materias`
--

CREATE TABLE `alumnos_materias` (
  `id_alumnos` int NOT NULL,
  `id_materia` int NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `alumnos_materias`
--

INSERT INTO `alumnos_materias` (`id_alumnos`, `id_materia`) VALUES
(2, 2),
(3, 3),
(3, 4),
(3, 5);

-- --------------------------------------------------------

--
-- Table structure for table `dias`
--

CREATE TABLE `dias` (
  `id_dia` int NOT NULL,
  `nombre_dia` varchar(20) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `dias`
--

INSERT INTO `dias` (`id_dia`, `nombre_dia`) VALUES
(1, 'LUNES'),
(2, 'MARTES'),
(3, 'MIERCOLES'),
(4, 'JUEVES'),
(5, 'VIERNES'),
(6, 'SABADO'),
(7, 'DOMINGO');

-- --------------------------------------------------------

--
-- Table structure for table `eventos`
--

CREATE TABLE `eventos` (
  `id_evento` int NOT NULL,
  `fecha` date NOT NULL,
  `descripcion` text,
  `tipo_evento` varchar(50) DEFAULT NULL,
  `id_materia` int DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `eventos`
--

INSERT INTO `eventos` (`id_evento`, `fecha`, `descripcion`, `tipo_evento`, `id_materia`) VALUES
(1, '2025-12-05', 'Examen de me matemáticas', 'examen', NULL),
(2, '2025-12-05', 'Álgebra', 'tarea', NULL),
(3, '2025-12-09', 'Examen', 'examen', NULL),
(4, '2025-12-10', 'Tarea de álgebra', 'recordatorio', NULL),
(5, '2025-12-03', 'Tarea de álgebra', 'tarea', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `inasistencias`
--

CREATE TABLE `inasistencias` (
  `id_inasistencia` int NOT NULL,
  `fecha` date NOT NULL,
  `id_alumnos` int DEFAULT NULL,
  `id_materia` int DEFAULT NULL,
  `justificada` tinyint(1) DEFAULT '0'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `inasistencias`
--

INSERT INTO `inasistencias` (`id_inasistencia`, `fecha`, `id_alumnos`, `id_materia`, `justificada`) VALUES
(2, '2025-12-02', 3, 5, 1);

-- --------------------------------------------------------

--
-- Table structure for table `materias`
--

CREATE TABLE `materias` (
  `id_materia` int NOT NULL,
  `nombre` varchar(100) NOT NULL,
  `duracion` int DEFAULT '1',
  `estado` enum('cursando','recursando','intensificando') DEFAULT 'cursando'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `materias`
--

INSERT INTO `materias` (`id_materia`, `nombre`, `duracion`, `estado`) VALUES
(2, 'Matemáticas', 2, 'cursando'),
(3, 'Álgebra', 1, 'cursando'),
(4, 'Literatura', 3, 'cursando'),
(5, 'Ciencias Naturales', 3, 'cursando');

-- --------------------------------------------------------

--
-- Table structure for table `materias_dias`
--

CREATE TABLE `materias_dias` (
  `id_materia` int NOT NULL,
  `id_dia` int NOT NULL,
  `horario` time NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `materias_dias`
--

INSERT INTO `materias_dias` (`id_materia`, `id_dia`, `horario`) VALUES
(2, 1, '08:00:00'),
(4, 1, '10:00:00'),
(2, 3, '08:00:00'),
(3, 3, '10:00:00'),
(5, 4, '11:00:00'),
(4, 5, '08:00:00');

-- --------------------------------------------------------

--
-- Table structure for table `profesores`
--

CREATE TABLE `profesores` (
  `id_profesor` int NOT NULL,
  `nombre` varchar(50) NOT NULL,
  `apellido` varchar(50) NOT NULL,
  `email` varchar(100) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `profesores`
--

INSERT INTO `profesores` (`id_profesor`, `nombre`, `apellido`, `email`) VALUES
(1, 'María', 'González', 'maria.g@escuela.com'),
(2, 'Jose', 'Diego', 'jose.d@gmail.com'),
(3, 'Lisa', 'Perez', 'lisa.p@escuela.com'),
(4, 'Sofia', 'Mongoni', 'sofia.m@gmail.com');

-- --------------------------------------------------------

--
-- Table structure for table `profesores_materias`
--

CREATE TABLE `profesores_materias` (
  `id_profesor` int NOT NULL,
  `id_materia` int NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `profesores_materias`
--

INSERT INTO `profesores_materias` (`id_profesor`, `id_materia`) VALUES
(1, 2),
(2, 3),
(3, 4),
(4, 5);

--
-- Indexes for dumped tables
--

--
-- Indexes for table `alumnos`
--
ALTER TABLE `alumnos`
  ADD PRIMARY KEY (`id_alumnos`),
  ADD UNIQUE KEY `DNI` (`DNI`),
  ADD UNIQUE KEY `email` (`email`);

--
-- Indexes for table `alumnos_eventos`
--
ALTER TABLE `alumnos_eventos`
  ADD PRIMARY KEY (`id_alumnos`,`id_evento`),
  ADD KEY `id_evento` (`id_evento`);

--
-- Indexes for table `alumnos_materias`
--
ALTER TABLE `alumnos_materias`
  ADD PRIMARY KEY (`id_alumnos`,`id_materia`),
  ADD KEY `id_materia` (`id_materia`);

--
-- Indexes for table `dias`
--
ALTER TABLE `dias`
  ADD PRIMARY KEY (`id_dia`);

--
-- Indexes for table `eventos`
--
ALTER TABLE `eventos`
  ADD PRIMARY KEY (`id_evento`),
  ADD KEY `id_materia` (`id_materia`);

--
-- Indexes for table `inasistencias`
--
ALTER TABLE `inasistencias`
  ADD PRIMARY KEY (`id_inasistencia`),
  ADD KEY `id_alumnos` (`id_alumnos`),
  ADD KEY `id_materia` (`id_materia`);

--
-- Indexes for table `materias`
--
ALTER TABLE `materias`
  ADD PRIMARY KEY (`id_materia`);

--
-- Indexes for table `materias_dias`
--
ALTER TABLE `materias_dias`
  ADD PRIMARY KEY (`id_materia`,`id_dia`,`horario`),
  ADD KEY `id_dia` (`id_dia`);

--
-- Indexes for table `profesores`
--
ALTER TABLE `profesores`
  ADD PRIMARY KEY (`id_profesor`);

--
-- Indexes for table `profesores_materias`
--
ALTER TABLE `profesores_materias`
  ADD PRIMARY KEY (`id_profesor`,`id_materia`),
  ADD KEY `id_materia` (`id_materia`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `alumnos`
--
ALTER TABLE `alumnos`
  MODIFY `id_alumnos` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `eventos`
--
ALTER TABLE `eventos`
  MODIFY `id_evento` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `inasistencias`
--
ALTER TABLE `inasistencias`
  MODIFY `id_inasistencia` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `materias`
--
ALTER TABLE `materias`
  MODIFY `id_materia` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `profesores`
--
ALTER TABLE `profesores`
  MODIFY `id_profesor` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `alumnos_eventos`
--
ALTER TABLE `alumnos_eventos`
  ADD CONSTRAINT `alumnos_eventos_ibfk_1` FOREIGN KEY (`id_alumnos`) REFERENCES `alumnos` (`id_alumnos`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `alumnos_eventos_ibfk_2` FOREIGN KEY (`id_evento`) REFERENCES `eventos` (`id_evento`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `alumnos_materias`
--
ALTER TABLE `alumnos_materias`
  ADD CONSTRAINT `alumnos_materias_ibfk_1` FOREIGN KEY (`id_alumnos`) REFERENCES `alumnos` (`id_alumnos`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `alumnos_materias_ibfk_2` FOREIGN KEY (`id_materia`) REFERENCES `materias` (`id_materia`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `eventos`
--
ALTER TABLE `eventos`
  ADD CONSTRAINT `eventos_ibfk_1` FOREIGN KEY (`id_materia`) REFERENCES `materias` (`id_materia`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Constraints for table `inasistencias`
--
ALTER TABLE `inasistencias`
  ADD CONSTRAINT `inasistencias_ibfk_1` FOREIGN KEY (`id_alumnos`) REFERENCES `alumnos` (`id_alumnos`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `inasistencias_ibfk_2` FOREIGN KEY (`id_materia`) REFERENCES `materias` (`id_materia`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Constraints for table `materias_dias`
--
ALTER TABLE `materias_dias`
  ADD CONSTRAINT `materias_dias_ibfk_1` FOREIGN KEY (`id_materia`) REFERENCES `materias` (`id_materia`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `materias_dias_ibfk_2` FOREIGN KEY (`id_dia`) REFERENCES `dias` (`id_dia`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `profesores_materias`
--
ALTER TABLE `profesores_materias`
  ADD CONSTRAINT `profesores_materias_ibfk_1` FOREIGN KEY (`id_profesor`) REFERENCES `profesores` (`id_profesor`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `profesores_materias_ibfk_2` FOREIGN KEY (`id_materia`) REFERENCES `materias` (`id_materia`) ON DELETE CASCADE ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
