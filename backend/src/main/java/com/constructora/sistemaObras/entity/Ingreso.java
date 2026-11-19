package com.constructora.sistemaObras.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "ingreso")
public class Ingreso {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_ingreso")
    private Integer idIngreso;

    // Llave foránea 1: Presupuesto al que abona este ingreso
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "id_presupuesto", nullable = false)
    private Presupuesto presupuesto;

    // Llave foránea 2: Cuenta bancaria de la constructora que recibe el depósito
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "id_cuenta", nullable = false)
    private CuentaBancaria cuentaBancaria;

    @Column(name = "monto", nullable = false, precision = 12, scale = 2)
    private BigDecimal monto;

    @Column(name = "fecha_deposito", nullable = false)
    private LocalDate fechaDeposito;

    @Column(name = "referencia", length = 100)
    private String referencia;

    @Enumerated(EnumType.STRING)
    @Column(name = "estatus", nullable = false, length = 20)
    private EstatusIngreso estatus = EstatusIngreso.PENDIENTE;

    // Constructor vacío obligatorio para JPA/Hibernate
    public Ingreso() {
    }

    // Getters y Setters
    public Integer getIdIngreso() {
        return idIngreso;
    }

    public void setIdIngreso(Integer idIngreso) {
        this.idIngreso = idIngreso;
    }

    public Presupuesto getPresupuesto() {
        return presupuesto;
    }

    public void setPresupuesto(Presupuesto presupuesto) {
        this.presupuesto = presupuesto;
    }

    public CuentaBancaria getCuentaBancaria() {
        return cuentaBancaria;
    }

    public void setCuentaBancaria(CuentaBancaria cuentaBancaria) {
        this.cuentaBancaria = cuentaBancaria;
    }

    public BigDecimal getMonto() {
        return monto;
    }

    public void setMonto(BigDecimal monto) {
        this.monto = monto;
    }

    public LocalDate getFechaDeposito() {
        return fechaDeposito;
    }

    public void setFechaDeposito(LocalDate fechaDeposito) {
        this.fechaDeposito = fechaDeposito;
    }

    public String getReferencia() {
        return referencia;
    }

    public void setReferencia(String referencia) {
        this.referencia = referencia;
    }

    public EstatusIngreso getEstatus() {
        return estatus;
    }

    public void setEstatus(EstatusIngreso estatus) {
        this.estatus = estatus;
    }
}