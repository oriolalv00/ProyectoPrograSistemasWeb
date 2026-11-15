package com.constructora.sistemaObras.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "presupuesto")
public class Presupuesto {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_presupuesto")
    private Integer idPresupuesto;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_obra", nullable = false, unique = true)
    private Obra obra;

    @Column(name = "monto_total", nullable = false, precision = 15, scale = 2)
    private BigDecimal montoTotal;

    @Column(name = "fecha_aprobacion")
    private LocalDate fechaAprobacion;

    @Enumerated(EnumType.STRING)
    @Column(name = "estatus", columnDefinition = "ENUM('BORRADOR','APROBADO','MODIFICADO')")
    private EstatusPresupuesto estatus = EstatusPresupuesto.BORRADOR;

    public Presupuesto() {
    }

    public Integer getIdPresupuesto() {
        return idPresupuesto;
    }

    public void setIdPresupuesto(Integer idPresupuesto) {
        this.idPresupuesto = idPresupuesto;
    }

    public Obra getObra() {
        return obra;
    }

    public void setObra(Obra obra) {
        this.obra = obra;
    }

    public BigDecimal getMontoTotal() {
        return montoTotal;
    }

    public void setMontoTotal(BigDecimal montoTotal) {
        this.montoTotal = montoTotal;
    }

    public LocalDate getFechaAprobacion() {
        return fechaAprobacion;
    }

    public void setFechaAprobacion(LocalDate fechaAprobacion) {
        this.fechaAprobacion = fechaAprobacion;
    }

    public EstatusPresupuesto getEstatus() {
        return estatus;
    }

    public void setEstatus(EstatusPresupuesto estatus) {
        this.estatus = estatus;
    }
}