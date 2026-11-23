package com.constructora.sistemaObras.entity;

import jakarta.persistence.*;

import java.util.List;

@Entity
@Table(name = "cuenta_bancaria")
public class CuentaBancaria {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_cuenta")
    private Integer idCuenta;

    @Column(name = "nombre_banco", nullable = false, length = 50)
    private String nombreBanco;

    @Column(name = "numero_cuenta", nullable = false, unique = true, length = 20)
    private String numeroCuenta;

    @Column(name = "is_activa", nullable = false)
    private Boolean isActiva = true;

    // --- Constructor vacío exigido por JPA ---
    public CuentaBancaria() {
    }

    // --- Getters y Setters ---
    public Integer getIdCuenta() {
        return idCuenta;
    }

    public void setIdCuenta(Integer idCuenta) {
        this.idCuenta = idCuenta;
    }

    public String getNombreBanco() {
        return nombreBanco;
    }

    public void setNombreBanco(String nombreBanco) {
        this.nombreBanco = nombreBanco;
    }

    public String getNumeroCuenta() {
        return numeroCuenta;
    }

    public void setNumeroCuenta(String numeroCuenta) {
        this.numeroCuenta = numeroCuenta;
    }

    public Boolean getIsActiva() {
        return isActiva;
    }

    public void setIsActiva(Boolean isActiva) {
        this.isActiva = isActiva;
    }

    public <E> List<E> getSaldoActual() {
        return null;
    }

    public void setSaldoActual(boolean add) {
        
    }
}
