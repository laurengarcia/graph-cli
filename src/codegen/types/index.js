const immutable = require('immutable')

const TYPE_CONVERSIONS = require('./conversions')

// Conversion utilities

const conversionsForTypeSystems = (fromTypeSystem, toTypeSystem) => {
  let conversions = TYPE_CONVERSIONS.getIn([fromTypeSystem, toTypeSystem])
  if (conversions === undefined) {
    throw new Error(
      `Conversions from '${fromTypeSystem}' to '${toTypeSystem}' are not supported`
    )
  }
  return conversions
}

const objectifyConversion = (fromTypeSystem, toTypeSystem, conversion) => {
  return immutable.fromJS({
    from: {
      typeSystem: fromTypeSystem,
      type: conversion.get(0),
    },
    to: {
      typeSystem: toTypeSystem,
      type: conversion.get(1),
    },
    convert: conversion.get(2),
  })
}

const findConversionFromType = (fromTypeSystem, toTypeSystem, fromType) => {
  let conversions = conversionsForTypeSystems(fromTypeSystem, toTypeSystem)

  let conversion = conversions.find(
    conversion =>
      typeof conversion.get(0) === 'string'
        ? conversion.get(0) === fromType
        : fromType.match(conversion.get(0))
  )

  if (conversion === undefined) {
    throw new Error(
      `Conversion from '${fromTypeSystem}' to '${toTypeSystem}' for ` +
        `source type '${fromType}' is not supported`
    )
  }

  return objectifyConversion(fromTypeSystem, toTypeSystem, conversion)
}

const findConversionToType = (fromTypeSystem, toTypeSystem, toType) => {
  let conversions = conversionsForTypeSystems(fromTypeSystem, toTypeSystem)

  let conversion = conversions.find(
    conversion =>
      typeof conversion.get(1) === 'string'
        ? conversion.get(1) === toType
        : toType.match(conversion.get(1))
  )

  if (conversion === undefined) {
    throw new Error(
      `Conversion from '${fromTypeSystem}' to '${toTypeSystem}' for ` +
        `target type '${toType}' is not supported`
    )
  }

  return objectifyConversion(fromTypeSystem, toTypeSystem, conversion)
}

// High-level type system API

const ascTypeForEthereum = ethereumType =>
  findConversionFromType('EthereumValue', 'AssemblyScript', ethereumType).getIn([
    'to',
    'type',
  ])

const ethereumTypeForAsc = ascType =>
  findConversionFromType('AssemblyScript', 'EthereumValue', ascType).getIn(['to', 'type'])

const ethereumValueToAsc = (code, ethereumType) =>
  findConversionFromType('EthereumValue', 'AssemblyScript', ethereumType).get('convert')(
    code
  )

const ascValueToEthereum = (code, ascType) =>
  findConversionToType('AssemblyScript', 'EthereumValue', ascType).get('convert')(code)

module.exports = {
  ascTypeForEthereum,
  ethereumTypeForAsc,
  ethereumValueToAsc,
  ascValueToEthereum,
}