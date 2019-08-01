import geostats from 'geostats';

export default class Statistics {
  static getEqualInterval(data, featureMin, featureMax, number_of_classes) {
    const serie = new geostats(data);

    return serie.getClassEqInterval(number_of_classes, featureMin, featureMax);
  }

  static getClassStdDeviation(data, featureMin, featureMax, number_of_classes) {
    const serie = new geostats(data);

    return serie.getClassStdDeviation(
      number_of_classes,
      featureMin,
      featureMax
    );
  }

  static getClassArithmeticProgression(
    data,
    featureMin,
    featureMax,
    number_of_classes
  ) {
    const serie = new geostats(data);

    return serie.getClassArithmeticProgression(
      number_of_classes,
      featureMin,
      featureMax
    );
  }

  static getClassGeometricProgression(
    data,
    featureMin,
    featureMax,
    number_of_classes
  ) {
    const serie = new geostats(data);

    return serie.getClassGeometricProgression(
      number_of_classes,
      featureMin,
      featureMax
    );
  }

  static getClassQuantile(data, featureMin, featureMax, number_of_classes) {
    const serie = new geostats(data);

    return serie.getClassQuantile(number_of_classes, featureMin, featureMax);
  }

  static getClassJenks(data, featureMin, featureMax, number_of_classes) {
    const serie = new geostats(data);

    return serie.getClassJenks(number_of_classes, featureMin, featureMax);
  }

  static getUniqueValues(data, featureMin, featureMax, number_of_classes) {
    const serie = new geostats(data);

    return serie.getUniqueValues(number_of_classes, featureMin, featureMax);
  }

  static getRanges(data) {
    const serie = new geostats(data);

    return serie.getRanges();
  }
}
