extends Area2D

signal enemy_destroyed

@export var speed = 150.0

func _ready():
	add_to_group("enemies")

func _process(delta):
	position.y += speed * delta

func destroy():
	emit_signal("enemy_destroyed")
	queue_free()

func _on_screen_exited():
	queue_free()
