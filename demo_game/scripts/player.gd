extends Area2D

signal player_died

@export var speed = 300.0
@onready var shoot_timer = $ShootTimer

var bullet_scene = preload("res://scenes/bullet.tscn")
var can_shoot = true

func _ready():
	pass

func _process(delta):
	var velocity = Vector2.ZERO

	if Input.is_action_pressed("move_left"):
		velocity.x -= 1
	if Input.is_action_pressed("move_right"):
		velocity.x += 1

	if velocity.length() > 0:
		velocity = velocity.normalized() * speed

	position += velocity * delta
	position.x = clamp(position.x, 20, 780)

	if Input.is_action_pressed("shoot") and can_shoot:
		shoot()

func shoot():
	can_shoot = false
	shoot_timer.start()

	var bullet = bullet_scene.instantiate()
	bullet.position = position + Vector2(0, -30)
	get_parent().add_child(bullet)

func _on_shoot_timer_timeout():
	can_shoot = true

func _on_area_entered(area):
	if area.is_in_group("enemies"):
		emit_signal("player_died")
		queue_free()
